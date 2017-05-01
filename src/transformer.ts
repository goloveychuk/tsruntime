
import * as ts from 'typescript';
import { Types, MetadataKey } from './types';



module Serializer {


  export function makeLiteral(type: Types.Type) {
    const assigns = []
    assigns.push(ts.createPropertyAssignment("kind", ts.createLiteral(type.kind)))
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

  function serializeExpressionWithArgs(type: ts.ExpressionWithTypeArguments): Types.Type {
    const typeArgs = type.typeArguments;
    let allTypes: Types.Type[] = [];
    if (typeArgs !== undefined) {
      allTypes = typeArgs.map(t => serializePropType(t))
    }
    return { kind: Types.TypeKind.Reference, arguments: allTypes, type: type.expression }
  }

  function serializeReference(type: ts.TypeReferenceNode): Types.Type {
    const typeArgs = type.typeArguments;
    let allTypes: Types.Type[] = [];
    if (typeArgs !== undefined) {
      allTypes = typeArgs.map(t => serializePropType(t))
    }
    return { kind: Types.TypeKind.Reference, arguments: allTypes, type: type.typeName }
  }

  function serializeUnion(type: ts.UnionTypeNode): Types.Type {
    const nestedTypes = type.types.map(t => serializePropType(t))
    return { kind: Types.TypeKind.Union, types: nestedTypes }
  }

  export function serializePropType(type: ts.TypeNode): Types.Type {
    switch (type.kind) {
      case ts.SyntaxKind.TypeReference:
        return serializeReference(<ts.TypeReferenceNode>type)
      case ts.SyntaxKind.ExpressionWithTypeArguments:
        return serializeExpressionWithArgs(<ts.ExpressionWithTypeArguments>type)
      case ts.SyntaxKind.UnionType:
        return serializeUnion(<ts.UnionTypeNode>type)
      case ts.SyntaxKind.NumberKeyword:
        return { kind: Types.TypeKind.Number }
      case ts.SyntaxKind.BooleanKeyword:
        return { kind: Types.TypeKind.Boolean }
      case ts.SyntaxKind.StringKeyword:
        return { kind: Types.TypeKind.String }
      case ts.SyntaxKind.UndefinedKeyword:
        return { kind: Types.TypeKind.Undefined }
      case ts.SyntaxKind.NullKeyword:
        return { kind: Types.TypeKind.Null }
      case ts.SyntaxKind.ArrayType: //todo test
        return { kind: Types.TypeKind.Array }
      default:
        throw new Error(`unknown type: ${type}`)
    }
  }
}
module ts2 {
  interface InternalNode {
    symbol?: ts.Symbol
  }
  export interface ClassDeclaration extends ts.ClassDeclaration, InternalNode { }
  export interface SourceFile extends ts.SourceFile, InternalNode { }
  export interface PropertyDeclaration extends ts.PropertyDeclaration, InternalNode { }

}




function Transformer(context: ts.TransformationContext) {
  function addDecorator(oldDecorators: ts.NodeArray<ts.Decorator> | undefined, exp: ts.Expression) {
    let newDecorators = ts.createNodeArray<ts.Decorator>()
    if (oldDecorators !== undefined) {
      newDecorators.push(...oldDecorators)
    }
    const decCall = ts.createCall(ts.createIdentifier('Reflect.metadata'), undefined, [ts.createLiteral(MetadataKey), exp])
    const dec = ts.createDecorator(decCall)
    newDecorators.push(dec)
    return newDecorators
  }

  function visitPropertyDeclaration(node: ts2.PropertyDeclaration) {
    if (node.type === undefined) {
      return node
    }
    let initializerExp;
    if (node.initializer !== undefined) {
      initializerExp = ts.createArrowFunction(undefined, undefined, [], undefined, undefined, node.initializer)
    }
    let serializedType = Serializer.serializePropType(node.type)
    if (node.questionToken !== undefined) {
      serializedType = { kind: Types.TypeKind.Union, types: [serializedType, { kind: Types.TypeKind.Undefined }] }
    }
    serializedType.initializer = initializerExp
    const objLiteral = Serializer.makeLiteral(serializedType)
    const newDecorators = addDecorator(node.decorators, objLiteral)
    let newNode = ts.getMutableClone(node);
    newNode.decorators = newDecorators
    return newNode
  }
  function visitClassMember(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.PropertyDeclaration:
        return visitPropertyDeclaration(<ts2.PropertyDeclaration>node)
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
        if (dec.expression.getText() == 'Reflective') {
          return true
        }
      }
    }
    return false
  }

  function getClassType(node: ts2.ClassDeclaration) {
    let extendsCls: Types.Type | undefined;
    if (node.heritageClauses !== undefined) {
      for (const clause of node.heritageClauses) {
        if (clause.token == ts.SyntaxKind.ExtendsKeyword) {
          if (clause.types.length != 1) {
            throw new Error(`extend clause should have exactly one type, ${clause.types}`)
          }
          extendsCls = Serializer.serializePropType(clause.types[0])
        }
      }
    }
    const props: string[] = []
    node.forEachChild(ch => {
      if (ch.kind == ts.SyntaxKind.PropertyDeclaration) {
        props.push((<ts.PropertyDeclaration>ch).name.getText())
      }
    })
    const classType: Types.ClassType = { props, kind: Types.TypeKind.Class, extends: extendsCls }
    return Serializer.makeLiteral(classType)
  }

  function visitClassDeclaration(node: ts2.ClassDeclaration) {
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

  function visitor(node: ts.Node): ts.VisitResult<ts.Node> {
    switch (node.kind) {
      case ts.SyntaxKind.ClassDeclaration:
        return visitClassDeclaration(<ts2.ClassDeclaration>node)
      default:
        return node
    }
  }

  function transform(source: ts2.SourceFile): ts2.SourceFile {
    if (source.isDeclarationFile) {
      return source
    }
    // const newStatements = ts.visitLexicalEnvironment(source.statements, visitor, context)
    // const newNode = ts.updateSourceFileNode(source, ts.setTextRange(newStatements, source.statements))
    const newNode = ts.visitEachChild(source, visitor, context);

    newNode.symbol = source.symbol;
    return newNode

  }
  return transform
}





export default function (): ts.CustomTransformers {
  return { //todo program
    before: [(context: ts.TransformationContext) => Transformer(context)]
  }
}