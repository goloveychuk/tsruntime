
import * as ts from 'typescript';
import { Types, MetadataKey, REFLECTIVE_KEY } from './types';
import * as tse from './typescript-extended'

type Ctx = {
  node: ts.Node
  // referencedSet: Set<string>
}



function writeWarning(node: ts.Node, msg: string) {
  const fname = node.getSourceFile().fileName;
  const location = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());
  const node_text = node.getText();
  console.warn(`\n\ntsruntime: ${msg}: ${fname} ${location.line}:${location.character}: ${node_text}\n`);
}


function Transformer(program: ts.Program, context: ts.TransformationContext) {
  let ReferencedSet = new Set<string>()

  ////hack (99
  const emitResolver = (<tse.TransformationContext>context).getEmitResolver()
  const oldIsReferenced = emitResolver.isReferencedAliasDeclaration
  emitResolver.isReferencedAliasDeclaration = function (node: ts.Node, checkChildren?: boolean) {
    const res = oldIsReferenced(node, checkChildren)
    if (res === true) {
      return true
    }
    if (node.kind === ts.SyntaxKind.ImportSpecifier) {
      const name = (<ts.ImportSpecifier>node).name
      // const symb = checker.getSymbolAtLocation(name)
      return ReferencedSet.has(name.getText())
    }
    return true
  }
  // hack
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
      case Types.TypeKind.Enum:
        assigns.push(ts.createPropertyAssignment("type", type.type))
      
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
  function getIdentifierForSymbol(type: ts.Type, ctx: Ctx): ts.Identifier {
    const name = checker.typeToString(type, ctx.node)
    const typeIdentifier = ts.createIdentifier(name)
    typeIdentifier.flags &= ~ts.NodeFlags.Synthesized;
    typeIdentifier.parent = currentScope;
    ReferencedSet.add(name)
    return typeIdentifier
  }


  function serializeInterface(type: ts.InterfaceType, ctx: Ctx): Types.Type {
    const symbol = type.getSymbol()
    if (symbol.valueDeclaration === undefined) {
      return { kind: Types.TypeKind.Interface, name: symbol.getName(), arguments: [] }
    }
    
    const typeName = getIdentifierForSymbol(type, ctx)
    return { kind: Types.TypeKind.Reference, type: typeName, arguments: [] }
  }

  function serializeReference(type: ts.TypeReference, ctx: Ctx): Types.Type {
    const typeArgs = type.typeArguments;
    let allTypes: Types.Type[] = [];
    if (typeArgs !== undefined) {
      allTypes = typeArgs.map(t => serializeType(t, ctx))
    }
    const target = type.target;
    if (target.objectFlags & ts.ObjectFlags.Tuple) {
      return { kind: Types.TypeKind.Tuple, elementTypes: allTypes }
    }
    const symbol = target.getSymbol()
    if (symbol.valueDeclaration === undefined) {
      return { kind: Types.TypeKind.Interface, name: symbol.getName(), arguments: allTypes }

    } else {
      const typeName = getIdentifierForSymbol(type, ctx)
      return { kind: Types.TypeKind.Reference, arguments: allTypes, type: typeName }
    }
  }
  function serializeClass(type: ts.InterfaceTypeWithDeclaredMembers, allprops: string[], ctx: Ctx): Types.Type {

    const base = type.getBaseTypes()
    let extendsCls: Types.Type | undefined;
    if (base.length > 0) {
      extendsCls = serializeType(base[0], ctx)
    }

    return { kind: Types.TypeKind.Class,  props: allprops, extends: extendsCls }
  }

  function serializeObject(type: ts.ObjectType, ctx: Ctx): Types.Type {
    if (type.objectFlags & ts.ObjectFlags.Reference) {
      return serializeReference(<ts.TypeReference>type, ctx)
    } else if (type.objectFlags & ts.ObjectFlags.Interface) {
      return serializeInterface(<ts.InterfaceType>type, ctx)
    } else if (type.objectFlags & ts.ObjectFlags.Anonymous) {
      return { kind: Types.TypeKind.Reference, type: ts.createIdentifier("Object"), arguments: [] }
    }
    writeWarning(ctx.node, `unknown object type: ${checker.typeToString(type)}`)
    return { kind: Types.TypeKind.Unknown }
  }



  function serializeUnion(type: ts.UnionType, ctx: Ctx): Types.Type {
    const nestedTypes = type.types.map(t => serializeType(t, ctx))
    return { kind: Types.TypeKind.Union, types: nestedTypes }
  }

  function serializeEnum(type: ts.EnumType, ctx: Ctx): Types.Type {
    const typeName = getIdentifierForSymbol(type, ctx)
    return { kind: Types.TypeKind.Enum, type: typeName }
  }

  function serializeType(type: ts.Type, ctx: Ctx): Types.Type {
    if (type.flags & ts.TypeFlags.Any) {
      return { kind: Types.TypeKind.Any }
    } else if (type.flags & ts.TypeFlags.String) {
      return { kind: Types.TypeKind.String }
    } else if (type.flags & ts.TypeFlags.Number) {
      return { kind: Types.TypeKind.Number }
    } else if (type.flags & ts.TypeFlags.Boolean) {
      return { kind: Types.TypeKind.Boolean }
    } else if (type.flags & ts.TypeFlags.Enum) {
      return serializeEnum(<ts.EnumType>type, ctx)
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
      return serializeObject(<ts.ObjectType>type, ctx)
    } else if (type.flags & ts.TypeFlags.Union) {
      return serializeUnion(<ts.UnionType>type, ctx)
    }
    writeWarning(ctx.node, `unknown type: ${checker.typeToString(type)}`)
    return { kind: Types.TypeKind.Unknown }
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

  function visitPropertyDeclaration(node: tse.PropertyDeclaration, allprops: string[]) {
    allprops.push(node.name.getText())
    const type = checker.getTypeAtLocation(node)
    let serializedType = serializeType(type, { node })
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
  function visitClassMember(node: ts.Node, allprops:string[]) {
    switch (node.kind) {
      case ts.SyntaxKind.PropertyDeclaration:
        return visitPropertyDeclaration(<tse.PropertyDeclaration>node, allprops)
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
        const decType = checker.getTypeAtLocation(dec.expression)
        if (decType.getProperty(REFLECTIVE_KEY) !== undefined) {
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
    const allprops = new Array<string>()

    const newMembers = ts.visitNodes(node.members, nod => visitClassMember(nod, allprops));

    const type = checker.getTypeAtLocation(node)
    let serializedType = serializeClass(<ts.InterfaceTypeWithDeclaredMembers>type, allprops, { node })

    const classTypeExp = makeLiteral(serializedType)

    const newNode = ts.getMutableClone(node);
    newNode.members = newMembers
    newNode.decorators = addDecorator(node.decorators, classTypeExp)
    return newNode
  }
  function onBeforeVisitNode(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.SourceFile:
      case ts.SyntaxKind.ModuleBlock:
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
      case ts.SyntaxKind.ModuleDeclaration:
      case ts.SyntaxKind.ModuleBlock:
      case ts.SyntaxKind.FunctionDeclaration:
      case ts.SyntaxKind.FunctionExpression:
      case ts.SyntaxKind.Block:
        return ts.visitEachChild(node, visitor, context)
      default:
        return node

    }
  }

  function transform(sourceI: ts.SourceFile): ts.SourceFile {
    ReferencedSet = new Set<string>()
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
