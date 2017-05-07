
import * as ts from 'typescript';
import { Types, MetadataKey } from './types';
import * as tse from './typescript-extended'

export function unwrap<T>(v: T | undefined, msg?: string) {
  if (v === undefined) {
    throw new Error(msg || "v is undefined")
  }
  return v
}




function Transformer(program: ts.Program, context: tse.TransformationContext) {
  const typeChecker = program.getTypeChecker()
  function makeLiteral(type: Types.Type) {
    const assigns = []
    assigns.push(ts.createPropertyAssignment("kind", ts.createLiteral(type.kind)))
    if (type.initializer !== undefined) {
      assigns.push(ts.createPropertyAssignment("initializer", type.initializer))
    }
    if (type.optional !== undefined) {
      assigns.push(ts.createPropertyAssignment("optional", ts.createLiteral(type.optional)))
    }
    switch (type.kind) {
      case Types.TypeKind.Boolean:
      case Types.TypeKind.Number:
      case Types.TypeKind.String:
      case Types.TypeKind.Null:
      case Types.TypeKind.Undefined:
      case Types.TypeKind.Tuple:
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
    const obj = ts.createObjectLiteral(assigns)
    // ts.setTextRange()
    return obj
  }

  // function serializeExpressionWithArgs(type: ts.ExpressionWithTypeArguments): Types.Type {
  //   const typeArgs = type.typeArguments;
  //   let allTypes: Types.Type[] = [];
  //   if (typeArgs !== undefined) {
  //     allTypes = typeArgs.map(t => serializePropType(t))
  //   }
  //   return { kind: Types.TypeKind.Reference, arguments: allTypes, type: type.expression }
  // }

  function serializeEndType(type: ts.ObjectType) {
    const typeNode = typeChecker.typeToTypeNode(type)
    switch (typeNode.kind) {
      case ts.SyntaxKind.TypeReference:
        const name = (<ts.TypeReferenceNode>typeNode).typeName
        name.parent = currentScope
        name.flags = 0
        return name
      case ts.SyntaxKind.ArrayType:
        return ts.createIdentifier('Array')
      // case ts.SyntaxKin
    }
    throw new Error(`unknown end type: ${typeChecker.typeToString(type)}`)
  }

  function serializeReference(type: ts.TypeReference): Types.Type {
    const typeArgs = type.typeArguments;
    let allTypes: Types.Type[] = [];
    if (typeArgs !== undefined) {
      allTypes = typeArgs.map(t => serializePropType(t))
    }
    const target = type.target;
    // const refType = ts.getMutableClone(type.target);
    // refType.flags &= ~ts.NodeFlags.Synthesized;
    // (<tse.Node>refType).original = undefined;
    // refType.parent = currentScope;
    const targetType = serializeObject(target)
    return { kind: Types.TypeKind.Reference, arguments: allTypes, type: targetType }
  }

  function serializeObject(type: ts.ObjectType): Types.Type {
    if (type.objectFlags & ts.ObjectFlags.Tuple) {
      return { kind: Types.TypeKind.Tuple }
    }    
    if (type.objectFlags & ts.ObjectFlags.Reference) {
      return serializeReference(<ts.TypeReference>type)
    } else if (type.objectFlags & ts.ObjectFlags.Interface) {
      return { kind: Types.TypeKind.Reference, type: serializeEndType(type), arguments: [] }
    } else if (type.objectFlags & ts.ObjectFlags.Anonymous) {
      return { kind: Types.TypeKind.Reference, type: ts.createIdentifier("Object"), arguments: [] }      
    }

    throw new Error(`unknown object type: ${typeChecker.typeToString(type)}`)
  }



  function serializeUnion(type: ts.UnionType): Types.Type {
    const nestedTypes = type.types.map(t => serializePropType(t))
    return { kind: Types.TypeKind.Union, types: nestedTypes }
  }

  function serializePropType(type: ts.Type): Types.Type {
    if (type.flags & ts.TypeFlags.Any) {
      return { kind: Types.TypeKind.Any }
    } else if (type.flags & ts.TypeFlags.String) {
      return { kind: Types.TypeKind.String }
    } else if (type.flags & ts.TypeFlags.Number) {
      return { kind: Types.TypeKind.Number }
    } else if (type.flags & ts.TypeFlags.Boolean) {
      return { kind: Types.TypeKind.Boolean }
    } else if (type.flags & ts.TypeFlags.Enum) {
      return { kind: Types.TypeKind.Enum } //todo
      // } else if (type.flags & ts.TypeFlags.StringLiteral) {
      //   return {kind: Types.TypeKind.StringLiteral} //todo
      // } else if (type.flags & ts.TypeFlags.NumberLiteral) {
      //   return {kind: Types.TypeKind.NumberLiteral} //todo
      // } else if (type.flags & ts.TypeFlags.BooleanLiteral) {
      //   return {kind: Types.TypeKind.BooleanLiteral} //todo
      // } else if (type.flags & ts.TypeFlags.EnumLiteral) {
      //   return {kind: Types.TypeKind.EnumLiteral} //todo
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
    throw new Error(`unknown type: ${typeChecker.typeToString(type)}`)
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
    const type = typeChecker.getTypeAtLocation(node)
    console.log(typeChecker.typeToString(type, undefined, ts.TypeFormatFlags.WriteArrowStyleSignature))
    let initializerExp;
    if (node.initializer !== undefined) {
      initializerExp = ts.createArrowFunction(undefined, undefined, [], undefined, undefined, node.initializer)
    }
    const t2 = <ts.TypeReferenceNode>typeChecker.typeToTypeNode(type)
    // const t = <ts.TypeReferenceNode>node.type
    // const objLiteral2 = t.typeName
    // let objLiteral = t2.typeName
    // objLiteral.parent = currentScope
    // objLiteral.flags = 0
    // objLiteral = ts.setTextRange(objLiteral, objLiteral2)

    let serializedType = serializePropType(type)
    serializedType.optional = node.questionToken !== undefined
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
        // const {declaration} = typeChecker.getResolvedSignature(dec)
        // const type = typeChecker.getTypeAtLocation(declaration)

        // const protSymb = type.getProperty("prototype")
        // const protType = typeChecker.getTypeOfSymbolAtLocation(protSymb, dec)
        // const vals = protType.getApparentProperties()
        if (dec.expression.getText() == 'Reflective') {
          return true
        }
      }
    }
    return false
  }

  function getClassType(node: tse.ClassDeclaration) {
    let extendsCls: Types.Type | undefined;
    // if (node.heritageClauses !== undefined) {
    //   for (const clause of node.heritageClauses) {
    //     if (clause.token == ts.SyntaxKind.ExtendsKeyword) {
    //       if (clause.types.length != 1) {
    //         throw new Error(`extend clause should have exactly one type, ${clause.types}`)
    //       }
    //       extendsCls = serializePropType(clause.types[0])
    //     }
    //   }
    // }
    const props: string[] = []
    node.forEachChild(ch => {
      if (ch.kind == ts.SyntaxKind.PropertyDeclaration) {
        props.push((<ts.PropertyDeclaration>ch).name.getText())
      }
    })
    const classType: Types.ClassType = { props, kind: Types.TypeKind.Class, extends: extendsCls }
    return makeLiteral(classType)
  }

  function visitClassDeclaration(node: tse.ClassDeclaration) {
    if (!shouldReflect(node)) {
      return node
    }
    const newNode = ts.getMutableClone(node);

    const newMembers = ts.visitNodes(node.members, visitClassMember);
    const classTypeExp = getClassType(node)
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
      default:
        return node
    }
  }

  function transform(sourceI: ts.SourceFile): ts.SourceFile {
    const source = sourceI as tse.SourceFile
    if (source.isDeclarationFile) {
      return source
    }
    // const newStatements = ts.visitLexicalEnvironment(source.statements, visitor, context)
    // const newNode = ts.updateSourceFileNode(source, ts.setTextRange(newStatements, source.statements))
    onBeforeVisitNode(source)
    const newNode = ts.visitEachChild(source, visitor, context);
    newNode.symbol = source.symbol;
    return newNode

  }
  return transform
}

export default function TransformerFactory(program: ts.Program) {
  return function (context: tse.TransformationContext) {
    return Transformer(program, context)
  }
}
