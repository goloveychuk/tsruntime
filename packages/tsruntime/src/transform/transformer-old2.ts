
import * as ts from 'typescript';
import * as tse from './typescript-extended'
import { MetadataKey, REFLECTIVE_KEY } from '../runtime/classUtils';
import {makeLiteral} from './makeLiteral'
import {reflectType, serializeClass} from './reflect'
import { Ctx, ScopeType } from './types';

function getSymbolId(symb: ts.Symbol): number {
  return (symb as any as { id: number }).id
}




function Transformer(program: ts.Program, context: ts.TransformationContext) {
  let ReferencedSet = new Set<number>()
      
  const markReferenced = (symb: ts.Symbol) => ReferencedSet.add(getSymbolId(symb)); 
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
      const origSymb = checker.getAliasedSymbol(checker.getSymbolAtLocation(name)!)
      // const symb = checker.getSymbolAtLocation(name)
      return ReferencedSet.has(getSymbolId(origSymb))
    }
    return true
  }
  // hack
  const checker = program.getTypeChecker()


  let currentScope: ScopeType

  function addDecorator(oldDecorators: ts.NodeArray<ts.Decorator> | undefined, exp: any) {
    let newDecorators = []
    if (oldDecorators !== undefined) {
      newDecorators.push(...oldDecorators)
    }
    const decCall = ts.createCall(ts.createIdentifier('Reflect.metadata'), undefined, [ts.createLiteral(MetadataKey), exp])
    const dec = ts.createDecorator(decCall)
    newDecorators.push(dec)
    return ts.createNodeArray<ts.Decorator>(newDecorators)
  }

  function visitPropertyDeclaration(node: tse.PropertyDeclaration, allprops: ts.PropertyName[]) {
    allprops.push(node.name)
    const type = checker.getTypeAtLocation(node)
    const ctx = new Ctx(checker, node, currentScope, markReferenced)
    let serializedType = reflectType(type, ctx)
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
  function visitClassMember(node: ts.Node, allprops: ts.PropertyName[]) {
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
        let typesToCheck: ts.Type[]
        if (decType.flags & ts.TypeFlags.UnionOrIntersection) {
          typesToCheck = (decType as ts.UnionOrIntersectionType).types
        } else {
          typesToCheck = [decType]
        }
        for (const t of typesToCheck) {
          if (t.getProperty(REFLECTIVE_KEY) !== undefined) {
            return true
          }
        }

      }
    }
    return false
  }



  function visitClassDeclaration(node: tse.ClassDeclaration) {
    if (!shouldReflect(node)) {
      return node
    }
    const allprops = new Array<ts.PropertyName>()

    const newMembers = ts.visitNodes(node.members, nod => visitClassMember(nod, allprops));

    const type = checker.getTypeAtLocation(node)
    const ctx = new Ctx(checker, node, currentScope, markReferenced)

    let serializedType = serializeClass(<ts.InterfaceTypeWithDeclaredMembers>type, allprops, ctx)

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
        currentScope = <ScopeType>node;
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
    ReferencedSet = new Set<number>()
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
