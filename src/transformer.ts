
import * as ts from 'typescript';
import { Types, MetadataKey } from './types';



module Serializer {


  export function makeLiteral(type: Types.Type) {
    const assigns = [ts.createPropertyAssignment("kind", ts.createLiteral(type.kind))]

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
    }
    return ts.createObjectLiteral(assigns)
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
  function addDecorator(node: ts.Node, exp: ts.Expression) {
    if (node.decorators === undefined) {
      return undefined
    }
    let newDecorators = ts.createNodeArray(node.decorators.concat())
    const decCall = ts.createCall(ts.createIdentifier('Reflect.metadata'), undefined, [ts.createLiteral(MetadataKey), exp])
    const dec = ts.createDecorator(decCall)
    newDecorators.push(dec)
    return newDecorators
  }

  function visitPropertyDeclaration(node: ts2.PropertyDeclaration) {
    if (node.type === undefined) {
      return node
    }
    let serializedType = Serializer.serializePropType(node.type)
    if (node.questionToken !== undefined) {
      serializedType = { kind: Types.TypeKind.Union, types: [serializedType, { kind: Types.TypeKind.Undefined }] }
    }
    const objLiteral = Serializer.makeLiteral(serializedType)
    const newDecorators = addDecorator(node, objLiteral)
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

  function visitClassDeclaration(node: ts2.ClassDeclaration) {
    if (!shouldReflect(node)) {
      return node
    }
    const newMembers = ts.visitNodes(node.members, visitClassMember);
    let newNode = ts.getMutableClone(node);
    // newNode.decorators = newDecorators
    newNode.members = newMembers
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





function TranformerFactory(context: ts.TransformationContext) {
  const tran = Transformer(context)
  return tran;
}

export default function (): ts.CustomTransformers {
  return {
    before: [TranformerFactory]
  }
}