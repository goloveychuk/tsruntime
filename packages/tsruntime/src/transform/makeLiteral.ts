import * as ts from 'typescript';

import {ReflectedType, TypeKind} from './types'


function getExpressionForPropertyName(name: ts.PropertyName) { //copied from typescript codebase (getExpressionForPropertyName)
    // if (ts.isComputedPropertyName(name)) {
    //   throw new Error('is computed property')
    // }

    if (ts.isIdentifier(name)) {
      return ts.factory.createStringLiteral(ts.idText(name))
    }
    return name
}

  
export function makeLiteral(type: ReflectedType): ts.ObjectLiteralExpression {
    const assigns = []
    const kindAssign = ts.factory.createPropertyAssignment("kind", ts.factory.createNumericLiteral(type.kind))
    const kindAssignComment = ts.addSyntheticTrailingComment(kindAssign, ts.SyntaxKind.MultiLineCommentTrivia, TypeKind[type.kind], false)
    assigns.push(kindAssignComment)

    if (type.initializer !== undefined) {
      assigns.push(ts.factory.createPropertyAssignment("initializer", type.initializer))
    }

    switch (type.kind) {
      case TypeKind.Object:
      case TypeKind.Class:
        if (type.name) {
          assigns.push(ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(type.name)))
        }
        // assigns.push(ts.factory.createPropertyAssignment("arguments", ts.createArrayLiteral(type.arguments.map(makeLiteral))))
        assigns.push(
          ts.factory.createPropertyAssignment(
            "properties",
            ts.factory.createObjectLiteralExpression(
              type.properties.map(({name, type}) =>
                ts.factory.createPropertyAssignment(getExpressionForPropertyName(name), makeLiteral(type))
              )
            )
          )
        )
        if (type.kind === TypeKind.Class) {
          assigns.push(ts.factory.createPropertyAssignment("constructors", ts.factory.createArrayLiteralExpression(
            (type).constructors.map(({modifiers, parameters}) =>
              ts.factory.createObjectLiteralExpression([
                ts.factory.createPropertyAssignment("modifiers", ts.factory.createNumericLiteral(modifiers)),
                ts.factory.createPropertyAssignment("parameters", ts.factory.createArrayLiteralExpression(
                  parameters.map(({name, modifiers, type}) => ts.factory.createObjectLiteralExpression([
                    ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(name)),
                    ts.factory.createPropertyAssignment("modifiers", ts.factory.createNumericLiteral(modifiers)),
                    ts.factory.createPropertyAssignment("type", makeLiteral(type)),
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
        assigns.push(
          ts.factory.createPropertyAssignment(
            "elementTypes",
            ts.factory.createArrayLiteralExpression(
              type.elementTypes.map(el => makeLiteral(el))
            )
          )
        );
        break
      case TypeKind.Union:
        assigns.push(
          ts.factory.createPropertyAssignment(
            "types",
            ts.factory.createArrayLiteralExpression(
              type.types.map(tp => makeLiteral(tp))
            )
          )
        );
        break
      case TypeKind.StringLiteral:
        assigns.push(ts.factory.createPropertyAssignment('value', ts.factory.createStringLiteral(type.value)))
        break
      case TypeKind.NumberLiteral:
        assigns.push(ts.factory.createPropertyAssignment('value', ts.factory.createNumericLiteral(type.value)))
        break
      case TypeKind.Reference:
        assigns.push(ts.factory.createPropertyAssignment("type", type.type))
        assigns.push(
          ts.factory.createPropertyAssignment(
            "arguments",
            ts.factory.createArrayLiteralExpression(
              type.arguments.map(arg => makeLiteral(arg))
            )
          )
        );
        break
      case TypeKind.Class:
        if (type.extends !== undefined) {
          assigns.push(ts.factory.createPropertyAssignment("extends", makeLiteral(type.extends)))
        }
        break
    }
    return ts.factory.createObjectLiteralExpression(assigns)
}
