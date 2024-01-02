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


export function makeLiteral(type: ReflectedType, modifier?: ts.ModifierFlags): ts.ObjectLiteralExpression {
    const assigns = []
    const kindAssign = ts.createPropertyAssignment("kind", ts.createLiteral(type.kind))
    const kindAssignComment = ts.addSyntheticTrailingComment(kindAssign, ts.SyntaxKind.MultiLineCommentTrivia, TypeKind[type.kind], false)
    assigns.push(kindAssignComment)

    if (type.initializer !== undefined) {
      assigns.push(ts.createPropertyAssignment("initializer", type.initializer))
    }

  if (modifier !== undefined) {
    assigns.push(ts.createPropertyAssignment("modifiers", ts.createLiteral(modifier)));
  }

    switch (type.kind) {
      case TypeKind.Object:
      case TypeKind.Class:
        if (type.name) {
          assigns.push(ts.createPropertyAssignment("name", ts.createLiteral(type.name)))
        }
        // assigns.push(ts.createPropertyAssignment("arguments", ts.createArrayLiteral(type.arguments.map(makeLiteral))))
        assigns.push(ts.createPropertyAssignment("properties", ts.createObjectLiteral(
          type.properties.map(({name, type, modifiers}) =>
            ts.createPropertyAssignment(getExpressionForPropertyName(name), makeLiteral(type, modifiers))
        ))))
        if (type.kind === TypeKind.Class) {
          assigns.push(ts.createPropertyAssignment("constructors", ts.createArrayLiteral(
            (type).constructors.map(({modifiers, parameters}) =>
              ts.createObjectLiteral([
                ts.createPropertyAssignment("modifiers", ts.createLiteral(modifiers)),
                ts.createPropertyAssignment("parameters", ts.createArrayLiteral(
                  parameters.map(({name, modifiers, type}) => ts.createObjectLiteral([
                    ts.createPropertyAssignment("name", ts.createLiteral(name)),
                    ts.createPropertyAssignment("modifiers", ts.createLiteral(modifiers)),
                    ts.createPropertyAssignment("type", makeLiteral(type)),
                  ]))
                ))
              ])
            )
          )))
        }
        break
    }
    switch (type.kind) {

      case TypeKind.Tuple:
        assigns.push(ts.createPropertyAssignment("elementTypes", ts.createArrayLiteral(type.elementTypes.map(el => makeLiteral(el)))))
        break
      case TypeKind.Union:
        assigns.push(ts.createPropertyAssignment("types", ts.createArrayLiteral(type.types.map(tp => makeLiteral(tp)))))
        break
      case TypeKind.StringLiteral:
      case TypeKind.NumberLiteral:
        assigns.push(ts.createPropertyAssignment('value', ts.createLiteral(type.value)))
        break
      case TypeKind.Reference:
        assigns.push(ts.createPropertyAssignment("type", type.type))
        assigns.push(ts.createPropertyAssignment("arguments", ts.createArrayLiteral(type.arguments.map(arg => makeLiteral(arg)))))
        break
      case TypeKind.Class:
        if (type.extends !== undefined) {
          assigns.push(ts.createPropertyAssignment("extends", makeLiteral(type.extends)))
        }
        break
    }
    return ts.createObjectLiteral(assigns)
}
