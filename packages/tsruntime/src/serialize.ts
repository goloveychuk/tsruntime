import * as ts from "typescript";
import { ReflectedType, TypeKind, Ctx } from "./types";

namespace Normalizers {
  function normalizeBooleans(types: ReflectedType[]): ReflectedType[] {
    let hasFalse = false;
    let hasTrue = false;
    let hasBoolean = false;

    for (const type of types) {
      switch (type.kind) {
        case TypeKind.FalseLiteral:
          hasFalse = true;
          break;
        case TypeKind.TrueLiteral:
          hasTrue = true;
          break;
        case TypeKind.Boolean:
          hasBoolean = true;
          break;
      }
    }

    if (hasBoolean || (hasTrue && hasFalse)) {
      return [{ kind: TypeKind.Boolean }];
    }
    return types;
  }

  export function normalizeUnion(types: ReflectedType[]) {
    const booleans: ReflectedType[] = [];
    const okTypes: ReflectedType[] = [];

    types.forEach(type => {
      switch (type.kind) {
        case TypeKind.FalseLiteral:
        case TypeKind.TrueLiteral:
        case TypeKind.Boolean:
          booleans.push(type);
          break;
        default:
          okTypes.push(type);
          break;
      }
    });

    const normalizedTypes: ReflectedType[] = [];

    if (booleans.length > 0) {
      normalizedTypes.push(...normalizeBooleans(booleans));
    }

    return okTypes.concat(normalizedTypes);
  }
}

function serializeUnion(type: ts.UnionType, ctx: Ctx): ReflectedType {
  const nestedTypes = type.types.map(t => serializeType(t, ctx));
  const normalizedTypes = Normalizers.normalizeUnion(nestedTypes);
  return { kind: TypeKind.Union, types: normalizedTypes };
}

function serializeReference(type: ts.TypeReference, ctx: Ctx): ReflectedType {
  const typeArgs = type.typeArguments;
  let allTypes: ReflectedType[] = [];
  if (typeArgs !== undefined) {
    allTypes = typeArgs.map(t => serializeType(t, ctx));
  }
  const target = type.target;
  if (target.objectFlags & ts.ObjectFlags.Tuple) {
    return { kind: TypeKind.Tuple, elementTypes: allTypes };
  }
  const symbol = target.getSymbol()!;
  if (symbol.valueDeclaration === undefined) {
    return {
      kind: TypeKind.Interface,
      name: symbol.getName(),
      arguments: allTypes
    };
  } else {
    const typeName = getIdentifierForSymbol(target, ctx);
    return { kind: TypeKind.Reference, arguments: allTypes, type: typeName };
  }
}

function getIdentifierForSymbol(type: ts.Type, ctx: Ctx): ts.Identifier {
  let name: string;
  
  const typenode = ctx.checker.typeToTypeNode(type, ctx.node)!; //todo not sure

  switch (typenode.kind) {
    case ts.SyntaxKind.TypeReference:
      const typename = (<ts.TypeReferenceNode>typenode).typeName;
      name = (<ts.Identifier>typename).text;
      let origSymb = type.getSymbol()!;
      if (origSymb.getFlags() & ts.SymbolFlags.Alias) {
        origSymb = ctx.checker.getAliasedSymbol(origSymb);
      }
      if (ctx.markReferenced) {
        ctx.markReferenced(origSymb)
      }
      break;
    default:
      name = type.getSymbol()!.getName();
  }
  const typeIdentifier = ts.createIdentifier(name);
  typeIdentifier.flags &= ~ts.NodeFlags.Synthesized;
  typeIdentifier.parent = ctx.currentScope;
  return typeIdentifier;
}

function serializeInterface(type: ts.InterfaceType, ctx: Ctx): ReflectedType {
  const symbol = type.getSymbol()!;
  if (symbol.valueDeclaration === undefined) {
    return { kind: TypeKind.Interface, name: symbol.getName(), arguments: [] };
  }

  const typeName = getIdentifierForSymbol(type, ctx);
  return { kind: TypeKind.Reference, type: typeName, arguments: [] };
}

function serializeObject(type: ts.ObjectType, ctx: Ctx): ReflectedType {
  if (type.objectFlags & ts.ObjectFlags.Reference) {
    return serializeReference(<ts.TypeReference>type, ctx);
  } else if (type.objectFlags & ts.ObjectFlags.Interface) {
    return serializeInterface(<ts.InterfaceType>type, ctx);
  } else if (type.objectFlags & ts.ObjectFlags.Anonymous) {
    return {
      kind: TypeKind.Reference,
      type: ts.createIdentifier("Object"),
      arguments: []
    };
  }
  ctx.reportUnknownType(type);
  return { kind: TypeKind.Unknown2 };
}

export function serializeType(type: ts.Type, ctx: Ctx): ReflectedType {
  if (type.flags & ts.TypeFlags.Any) {
    return { kind: TypeKind.Any };
  } else if (type.flags & ts.TypeFlags.StringLiteral) {
    return {
      kind: TypeKind.StringLiteral,
      value: (type as ts.StringLiteralType).value
    };
  } else if (type.flags & ts.TypeFlags.NumberLiteral) {
    return {
      kind: TypeKind.NumberLiteral,
      value: (type as ts.NumberLiteralType).value
    };
  } else if (type.flags & ts.TypeFlags.String) {
    return { kind: TypeKind.String };
  } else if (type.flags & ts.TypeFlags.Number) {
    return { kind: TypeKind.Number };
  } else if (type.flags & ts.TypeFlags.Boolean) {
    return { kind: TypeKind.Boolean };
  } else if (type.flags & ts.TypeFlags.BooleanLiteral) {
    switch ((type as any).intrinsicName) {
      case "true":
        return { kind: TypeKind.TrueLiteral };
      case "false":
        return { kind: TypeKind.FalseLiteral };
    }
  } else if (type.flags & ts.TypeFlags.ESSymbol) {
    return { kind: TypeKind.ESSymbol };
  } else if (type.flags & ts.TypeFlags.Void) {
    return { kind: TypeKind.Void };
  } else if (type.flags & ts.TypeFlags.Undefined) {
    return { kind: TypeKind.Undefined };
  } else if (type.flags & ts.TypeFlags.Null) {
    return { kind: TypeKind.Null };
  } else if (type.flags & ts.TypeFlags.Never) {
    return { kind: TypeKind.Never };
  } else if (type.flags & ts.TypeFlags.Unknown) {
    return { kind: TypeKind.Unknown };
  } else if (type.flags & ts.TypeFlags.Object) {
    return serializeObject(<ts.ObjectType>type, ctx);
  } else if (type.flags & ts.TypeFlags.Union) {
    return serializeUnion(<ts.UnionType>type, ctx);
  }
  ctx.reportUnknownType(type)
  return { kind: TypeKind.Unknown2 };
}

export function serializeClass(
  type: ts.InterfaceTypeWithDeclaredMembers,
  allprops: ts.PropertyName[],
  ctx: Ctx
): ReflectedType {
  const base = type.getBaseTypes()!;
  let extendsCls: ReflectedType | undefined;
  if (base.length > 0) {
    extendsCls = serializeType(base[0], ctx);
  }

  return {
    kind: TypeKind.Class,
    name: type.getSymbol()!.getName(),
    props: allprops,
    extends: extendsCls
  };
}
