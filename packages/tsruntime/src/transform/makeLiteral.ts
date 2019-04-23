import * as ts from 'typescript';

import {ReflectedType, TypeKind} from './types'


function getExpressionForPropertyName(name: ts.PropertyName) { //copied from typescript codebase (getExpressionForPropertyName)
    // if (ts.isComputedPropertyName(name)) {
    //   throw new Error('is computed property')
    // }
  
    if (ts.isIdentifier(name)) {
      return ts.createLiteral(ts.idText(name))
    }
    return name
}

  
export function makeLiteral(type: ReflectedType): ts.ObjectLiteralExpression {
    const assigns = []
    const kindAssign = ts.createPropertyAssignment("kind", ts.createLiteral(type.kind))
    const kindAssignComment = ts.addSyntheticTrailingComment(kindAssign, ts.SyntaxKind.MultiLineCommentTrivia, TypeKind[type.kind], false)
    assigns.push(kindAssignComment)
    if (type.initializer !== undefined) {
      assigns.push(ts.createPropertyAssignment("initializer", type.initializer))
    }

    switch (type.kind) {
      case TypeKind.Object:
      case TypeKind.Class: //todo
        if (type.name) {
          assigns.push(ts.createPropertyAssignment("name", ts.createLiteral(type.name)))
        }
        // assigns.push(ts.createPropertyAssignment("arguments", ts.createArrayLiteral(type.arguments.map(makeLiteral))))
        assigns.push(ts.createPropertyAssignment("properties", ts.createObjectLiteral(
          type.properties.map(({name, type}) =>
            ts.createPropertyAssignment(getExpressionForPropertyName(name), makeLiteral(type))
        ))))
        break
      case TypeKind.Tuple:
        assigns.push(ts.createPropertyAssignment("elementTypes", ts.createArrayLiteral(type.elementTypes.map(makeLiteral))))
        break
      case TypeKind.Union:
        assigns.push(ts.createPropertyAssignment("types", ts.createArrayLiteral(type.types.map(makeLiteral))))
        break
      case TypeKind.StringLiteral:
      case TypeKind.NumberLiteral:
        assigns.push(ts.createPropertyAssignment('value', ts.createLiteral(type.value)))
        break
      case TypeKind.Reference:
        assigns.push(ts.createPropertyAssignment("type", type.type))
        assigns.push(ts.createPropertyAssignment("arguments", ts.createArrayLiteral(type.arguments.map(makeLiteral))))
        break
      case TypeKind.Class:
        assigns.push(ts.createPropertyAssignment("name", ts.createLiteral(type.name)))
        // assigns.push(ts.createPropertyAssignment("props", ts.createArrayLiteral(type.props.map(getExpressionForPropertyName))))
        if (type.extends !== undefined) {
          assigns.push(ts.createPropertyAssignment("extends", makeLiteral(type.extends)))
        }
        break
    }
    return ts.createObjectLiteral(assigns)
}