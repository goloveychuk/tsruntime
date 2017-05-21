
import * as ts from 'typescript';
import { Types, MetadataKey } from './types';
import * as tse from './typescript-extended'

export function unwrap<T>(v: T | undefined, msg?: string) {
  if (v === undefined) {
    throw new Error(msg || "v is undefined")
  }
  return v
}


function writeError(node: ts.Node, msg: string, shouldThrow: boolean=true) {
    const fname = node.getSourceFile().fileName;
    const location = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());
    const node_text = node.getText();
    console.warn(`\n\ntsruntime: ${msg}: ${fname} ${location.line}:${location.character}: ${node_text}\n`);
  }

function Transformer(program: ts.Program, context: ts.TransformationContext) {
  const checker = program.getTypeChecker()
  function makeLiteral(type: Types.Type) {
    const assigns = []
    const kindAssign = ts.createPropertyAssignment("kind", ts.createLiteral(type.kind))
    const kindAssignComment = ts.addSyntheticTrailingComment(kindAssign, ts.SyntaxKind.MultiLineCommentTrivia, Types.TypeKind[type.kind], false)
    assigns.push(kindAssignComment)
    if (type.initializer !== undefined) {
      assigns.push(ts.createPropertyAssignment("initializer", type.initializer))
    }
    switch (type.kind) {
      case Types.TypeKind.Boolean:
      case Types.TypeKind.Number:
      case Types.TypeKind.String:
      case Types.TypeKind.Null:
      case Types.TypeKind.Undefined:
        break
      case Types.TypeKind.Interface:
        assigns.push(ts.createPropertyAssignment("name", ts.createLiteral(type.name)))
        assigns.push(ts.createPropertyAssignment("arguments", ts.createArrayLiteral(type.arguments.map(makeLiteral))))
        break
      case Types.TypeKind.Tuple:
        assigns.push(ts.createPropertyAssignment("elementTypes", ts.createArrayLiteral(type.elementTypes.map(makeLiteral))))
        break
      case Types.TypeKind.Union:
        assigns.push(ts.createPropertyAssignment("types", ts.createArrayLiteral(type.types.map(makeLiteral))))
        break
      case Types.TypeKind.Reference:
        assigns.push(ts.createPropertyAssignment("type", type.type))
        assigns.push(ts.createPropertyAssignment("arguments", ts.createArrayLiteral(type.arguments.map(makeLiteral))))
        break
      case Types.TypeKind.Class:
        assigns.push(ts.createPropertyAssignment("props", ts.createArrayLiteral(type.props.map(ts.createLiteral))))
        if (type.extends !== undefined) {
          assigns.push(ts.createPropertyAssignment("extends", makeLiteral(type.extends)))
        }
        break
    }
    return ts.createObjectLiteral(assigns)
  }
  function getIdentifierForSymbol(symbol: ts.Symbol): ts.Identifier {
    const typeIdentifier = ts.createIdentifier(symbol.getName())
    typeIdentifier.flags &= ~ts.NodeFlags.Synthesized;
    typeIdentifier.parent = currentScope;
    return typeIdentifier
  }


  function serializeInterface(type: ts.InterfaceType): Types.Type {
    const symbol = type.getSymbol()
    if (symbol.valueDeclaration === undefined) {
      return { kind: Types.TypeKind.Interface, name: symbol.getName(), arguments: [] }
    }
    const typeName = getIdentifierForSymbol(symbol)
    return { kind: Types.TypeKind.Reference, type: typeName, arguments: [] }
  }

  function serializeReference(type: ts.TypeReference): Types.Type {
    const typeArgs = type.typeArguments;
    let allTypes: Types.Type[] = [];
    if (typeArgs !== undefined) {
      allTypes = typeArgs.map(t => serializeType(t))
    }
    const target = type.target;
    if (target.objectFlags & ts.ObjectFlags.Tuple) {
      return { kind: Types.TypeKind.Tuple, elementTypes: allTypes }
    }
    const symbol = target.getSymbol()
    if (symbol.valueDeclaration === undefined) {
      return { kind: Types.TypeKind.Interface, name: symbol.getName(), arguments: allTypes }

    } else {
      const typeName = getIdentifierForSymbol(symbol)
      return { kind: Types.TypeKind.Reference, arguments: allTypes, type: typeName }
    }
  }
  function serializeClass(type: ts.InterfaceTypeWithDeclaredMembers): Types.Type {
    const parent = type.getSymbol();
    type.getProperties() //to fill declared props
    let props = type.declaredProperties.map(prop => prop.getName())
    const base = type.getBaseTypes()
    let extendsCls: Types.Type | undefined;
    if (base.length > 0) {
      extendsCls = serializeType(base[0])
    }
    return { kind: Types.TypeKind.Class, props, extends: extendsCls }
  }

  function serializeObject(type: ts.ObjectType): Types.Type {
    if (type.objectFlags & ts.ObjectFlags.Class) {
      return serializeClass(<ts.InterfaceTypeWithDeclaredMembers>type)
    }
    if (type.objectFlags & ts.ObjectFlags.Reference) {
      return serializeReference(<ts.TypeReference>type)
    } else if (type.objectFlags & ts.ObjectFlags.Interface) {
      return serializeInterface(<ts.InterfaceType>type)
    } else if (type.objectFlags & ts.ObjectFlags.Anonymous) {
      return { kind: Types.TypeKind.Reference, type: ts.createIdentifier("Object"), arguments: [] }
    }

    throw new Error(`unknown object type: ${checker.typeToString(type)}`)
  }



  function serializeUnion(type: ts.UnionType): Types.Type {
    const nestedTypes = type.types.map(t => serializeType(t))
    return { kind: Types.TypeKind.Union, types: nestedTypes }
  }

  function serializeType(type: ts.Type): Types.Type {
    if (type.flags & ts.TypeFlags.Any) {
      return { kind: Types.TypeKind.Any }
    } else if (type.flags & ts.TypeFlags.String) {
      return { kind: Types.TypeKind.String }
    } else if (type.flags & ts.TypeFlags.Number) {
      return { kind: Types.TypeKind.Number }
    } else if (type.flags & ts.TypeFlags.Boolean) {
      return { kind: Types.TypeKind.Boolean }
    } else if (type.flags & ts.TypeFlags.Enum) {
      return { kind: Types.TypeKind.Enum }
    } else if (type.flags & ts.TypeFlags.ESSymbol) {
      return { kind: Types.TypeKind.ESSymbol }
    } else if (type.flags & ts.TypeFlags.Void) {
      return { kind: Types.TypeKind.Void }
    } else if (type.flags & ts.TypeFlags.Undefined) {
      return { kind: Types.TypeKind.Undefined }
    } else if (type.flags & ts.TypeFlags.Null) {
      return { kind: Types.TypeKind.Null }
    } else if (type.flags & ts.TypeFlags.Never) {
      return { kind: Types.TypeKind.Never }
    } else if (type.flags & ts.TypeFlags.Object) {
      return serializeObject(<ts.ObjectType>type)
    } else if (type.flags & ts.TypeFlags.Union) {
      return serializeUnion(<ts.UnionType>type)
    }
    // writeError(type `unknown type: ${checker.typeToString(type)}`, false)
    return {kind: Types.TypeKind.Unknown}
  }



  let currentScope: ts.SourceFile | ts.CaseBlock | ts.ModuleBlock | ts.Block;
  function addDecorator(oldDecorators: ts.NodeArray<ts.Decorator> | undefined, exp: any) {
    let newDecorators = ts.createNodeArray<ts.Decorator>()
    if (oldDecorators !== undefined) {
      newDecorators.push(...oldDecorators)
    }
    const decCall = ts.createCall(ts.createIdentifier('Reflect.metadata'), undefined, [ts.createLiteral(MetadataKey), exp])
    const dec = ts.createDecorator(decCall)
    newDecorators.push(dec)
    return newDecorators
  }

  function visitPropertyDeclaration(node: tse.PropertyDeclaration) {
    const type = checker.getTypeAtLocation(node)
    let serializedType = serializeType(type)
    let initializerExp;
    if (node.initializer !== undefined) {
      initializerExp = ts.createArrowFunction(undefined, undefined, [], undefined, undefined, node.initializer)
    }
    serializedType.initializer = initializerExp
    const objLiteral = makeLiteral(serializedType)
    const newDecorators = addDecorator(node.decorators, objLiteral)
    let newNode = ts.getMutableClone(node);
    newNode.decorators = newDecorators
    return newNode
  }
  function visitClassMember(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.PropertyDeclaration:
        return visitPropertyDeclaration(<tse.PropertyDeclaration>node)
      default:
        return node
    }
  }

  function shouldReflect(node: ts.Node) {
    if (node.decorators === undefined) {
      return false
    }
    for (const dec of node.decorators) {
      if (dec.kind == ts.SyntaxKind.Decorator) {
        const declaration  = checker.getResolvedSignature(dec).declaration
        const filename = declaration.getSourceFile().fileName;
        if (filename.endsWith("tsruntime/src/types.ts") || filename.endsWith("tsruntime/dist/types.d.ts")) {
          return true
        }
      }
    }
    return false
  }



  function visitClassDeclaration(node: tse.ClassDeclaration) {
    if (!shouldReflect(node)) {
      return node
    }
    const newNode = ts.getMutableClone(node);
    const newMembers = ts.visitNodes(node.members, visitClassMember);

    const type = checker.getTypeAtLocation(node)

    const classTypeExp = makeLiteral(serializeType(type))
    newNode.members = newMembers
    newNode.decorators = addDecorator(node.decorators, classTypeExp)
    return newNode
  }
  function onBeforeVisitNode(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.SourceFile:
      case ts.SyntaxKind.CaseBlock:
      case ts.SyntaxKind.ModuleBlock:
      case ts.SyntaxKind.Block:
        currentScope = <ts.SourceFile | ts.CaseBlock | ts.ModuleBlock | ts.Block>node;
        // currentScopeFirstDeclarationsOfName = undefined;
        break;
    }
  }
  function visitor(node: ts.Node): ts.VisitResult<ts.Node> {
    onBeforeVisitNode(node)
    switch (node.kind) {
      case ts.SyntaxKind.ClassDeclaration:
        return visitClassDeclaration(<tse.ClassDeclaration>node)
      // case ts.SyntaxKind.Identifier:
      // return node
      default:
        // console.log(node.kind)
        // return ts.visitEachChild(node, visitor, context)
        return node
    }
  }

  function transform(sourceI: ts.SourceFile): ts.SourceFile {
    const source = sourceI as tse.SourceFile
    if (source.isDeclarationFile) {
      return source
    }
    onBeforeVisitNode(source)
    const newNode = ts.visitEachChild(source, visitor, context);
    newNode.symbol = source.symbol;
    return newNode

  }
  return transform
}



export default function TransformerFactory(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
  return (ctx: ts.TransformationContext) => Transformer(program, ctx)
}
