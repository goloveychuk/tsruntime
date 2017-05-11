
import * as ts from 'typescript';
import { Types, MetadataKey } from './types';
import * as tse from './typescript-extended'

export function unwrap<T>(v: T | undefined, msg?: string) {
  if (v === undefined) {
    throw new Error(msg || "v is undefined")
  }
  return v
}




function Transformer(context: ts.TransformationContext) {
  function showWarning(node: ts.Node, msg: string) {
    const fname = node.getSourceFile().fileName;
    const location = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());
    const node_text = node.getText();
    console.warn(`\n\ntsruntime: ${msg}: ${fname} ${location.line}:${location.character}: ${node_text}\n`);
  }

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
    const obj = ts.createObjectLiteral(assigns)
    // ts.setTextRange()
    return obj
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
    if (type.typeName.kind !== ts.SyntaxKind.Identifier) {
      showWarning(type, `Unknown typename.kind (${type.typeName.kind})`);
      throw new Error(`uknown typename.kind ${type.typeName.kind}`)
    }
    return serializeGenericType(type.typeName, type.typeArguments)
  }

  function serializeUnion(type: ts.UnionTypeNode): Types.Type {
    const nestedTypes = type.types.map(t => serializePropType(t))
    return { kind: Types.TypeKind.Union, types: nestedTypes }
  }

  function serializeTuple(type: ts.TupleTypeNode): Types.Type {
    const elementTypes = type.elementTypes.map(serializePropType)
    return { kind: Types.TypeKind.Tuple, elementTypes }
  }

  function serializeArray(type: ts.ArrayTypeNode): Types.Type {
    const t = serializePropType(type.elementType)
    return { kind: Types.TypeKind.Reference, arguments: [t], type: ts.createIdentifier('Array') }
  }

  function serializePropType(type: ts.TypeNode): Types.Type {
    switch (type.kind) {
      case ts.SyntaxKind.TypeReference:
        return serializeReference(<ts.TypeReferenceNode>type)
      case ts.SyntaxKind.ExpressionWithTypeArguments:
        return serializeExpressionWithArgs(<ts.ExpressionWithTypeArguments>type)
      case ts.SyntaxKind.UnionType:
        return serializeUnion(<ts.UnionTypeNode>type)
      case ts.SyntaxKind.AnyKeyword:
        return { kind: Types.TypeKind.Any }
      case ts.SyntaxKind.VoidKeyword:
        return { kind: Types.TypeKind.Void }
      case ts.SyntaxKind.NeverKeyword:
        return { kind: Types.TypeKind.Never }
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
      case ts.SyntaxKind.SymbolKeyword:
        return { kind: Types.TypeKind.ESSymbol }
      case ts.SyntaxKind.ArrayType:
        return serializeArray(<ts.ArrayTypeNode>type)
      case ts.SyntaxKind.TupleType:
        return serializeTuple(<ts.TupleTypeNode>type)
      default:
        showWarning(type, "Unknown type");
        throw new Error(`unknown type: ${type.kind}`)
    }
  }
  function serializeGenericType(typeName: ts.Expression, typeArguments?: ts.NodeArray<ts.TypeNode>): Types.Type {
    const newTypeName = ts.createIdentifier(typeName.getText())
    newTypeName.parent = currentScope
    newTypeName.flags = 0
    const typeArgs: ts.TypeNode[] = (typeArguments || []);
    return { kind: Types.TypeKind.Reference, type: newTypeName, arguments: typeArgs.map(t => serializePropType(t)) }
  }

  function serializeTypeFromInitializer(initializer: ts.Expression): Types.Type {
    switch (initializer.kind) {
      case ts.SyntaxKind.FalseKeyword:
      case ts.SyntaxKind.TrueKeyword:
        return { kind: Types.TypeKind.Boolean }
      case ts.SyntaxKind.StringLiteral:
        return { kind: Types.TypeKind.String }
      case ts.SyntaxKind.NumericLiteral:
        return { kind: Types.TypeKind.Number }
      case ts.SyntaxKind.NullKeyword:
        return { kind: Types.TypeKind.Null }
      case ts.SyntaxKind.ArrayLiteralExpression:
        return { kind: Types.TypeKind.Reference, type: ts.createIdentifier('Array'), arguments: [] }
      case ts.SyntaxKind.Identifier:
        switch (initializer.getText()) {
          case "undefined":
            return { kind: Types.TypeKind.Undefined }
          default:
            showWarning(initializer, 'Unknown identifier type');
            throw new Error(`unknown identifier type: ${initializer.getText()}`)
        }
      case ts.SyntaxKind.CallExpression:
      case ts.SyntaxKind.NewExpression:
        const callExp = (<ts.CallExpression>initializer)
        return serializeGenericType(callExp.expression, callExp.typeArguments)
      default:
        showWarning(initializer, 'Unknown initializer type');
        throw new Error(`unknown initializer type: ${initializer.kind}`)
    }
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
    let serializedType: Types.Type;
    let initializerExp;
    if (node.type == undefined) {
      serializedType = serializeTypeFromInitializer(unwrap(node.initializer))
    } else {
      serializedType = serializePropType(node.type)
    }
    if (node.initializer !== undefined) {
      initializerExp = ts.createArrowFunction(undefined, undefined, [], undefined, undefined, node.initializer)
    }

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
        // Find decorator name. If decorator is called as function, then name is at first child.
        const dec_name = (dec.expression.getChildCount() === 0) ?
                          dec.expression.getText() :
                          dec.expression.getChildAt(0).getText();

        if (transformConfig.decoratorNames.indexOf(dec_name) != -1) {
          return true
        }
      }
    }
    return false
  }

  function getClassType(node: tse.ClassDeclaration) {
    let extendsCls: Types.Type | undefined;
    if (node.heritageClauses !== undefined) {
      for (const clause of node.heritageClauses) {
        if (clause.token == ts.SyntaxKind.ExtendsKeyword) {
          if (clause.types.length != 1) {
            throw new Error(`extend clause should have exactly one type, ${clause.types}`)
          }
          extendsCls = serializePropType(clause.types[0])
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
    onBeforeVisitNode(source)
    const newNode = ts.visitEachChild(source, visitor, context);
    newNode.symbol = source.symbol;
    return newNode

  }
  return transform
}

/**
 * Configuration settings for the transformer.
 */
export interface IConfig {
  /** List of decorator names that mark classes to attach runtime data. */
  decoratorNames?: string[]
}

class TransformConfig {
  decoratorNames: string[] = ['Reflective'];

  applyConfig(config: IConfig) {
    this.decoratorNames = config.decoratorNames || this.decoratorNames;
  }
}

const transformConfig: TransformConfig = new TransformConfig();



export default function TransformerFactory(config?: IConfig): ts.TransformerFactory<ts.SourceFile> {
  if (config != undefined) {
    transformConfig.applyConfig(config);
  }
  return Transformer;
}
