import * as ts from "typescript";
import * as tse from "./typescript-extended";
import { REFLECTIVE_KEY } from "../runtime/common";
import { makeLiteral } from "./makeLiteral";
import { getReflect } from "./reflect";
import { Ctx, ScopeType } from "./types";

function getSymbolId(symb: ts.Symbol): number {
  return ((symb as any) as { id: number }).id;
}

function shouldReflect(
  checker: ts.TypeChecker,
  node: ts.CallExpression | ts.Decorator
) {
  const type = checker.getTypeAtLocation(node.expression);

  return Boolean(getPropertyInMaybeUnion(checker, type, REFLECTIVE_KEY));
}

function getPropertyInMaybeUnion(
  checker: ts.TypeChecker,
  type: ts.Type,
  propertyName: string
) {
  let typesToCheck: ts.Type[];
  if (type.flags & ts.TypeFlags.UnionOrIntersection) {
    typesToCheck = (type as ts.UnionOrIntersectionType).types;
  } else {
    typesToCheck = [type];
  }

  return typesToCheck.find(type =>
    Boolean(checker.getPropertyOfType(type, propertyName))
  );
}


function patchEmitResolver(
  checker: ts.TypeChecker,
  context: ts.TransformationContext
) {
  let ReferencedSet = new Set<number>();

  const markReferenced = (symb: ts.Symbol) =>
    ReferencedSet.add(getSymbolId(symb));
  ////hack (99
  const emitResolver = (<tse.TransformationContext>context).getEmitResolver();
  const oldIsReferenced = emitResolver.isReferencedAliasDeclaration;
  emitResolver.isReferencedAliasDeclaration = function(
    node: ts.Node,
    checkChildren?: boolean
  ) {
    const res = oldIsReferenced(node, checkChildren);
    if (res === true) {
      return true;
    }
    if (node.kind === ts.SyntaxKind.ImportSpecifier) {
      const name = (<ts.ImportSpecifier>node).name;
      const origSymb = checker.getAliasedSymbol(
        checker.getSymbolAtLocation(name)!
      );
      // const symb = checker.getSymbolAtLocation(name)
      return ReferencedSet.has(getSymbolId(origSymb));
    }
    return true;
  };

  const onNewSourceFile = () => {
    ReferencedSet.clear();
  };
  return { markReferenced, onNewSourceFile };
}

function Transformer(program: ts.Program, context: ts.TransformationContext) {
  let currentScope: ScopeType;

  const checker = program.getTypeChecker();

  const { markReferenced, onNewSourceFile } = patchEmitResolver(
    checker,
    context
  );

  const createContext = (node: ts.Node) =>
    new Ctx(checker, node, currentScope, markReferenced);

  function visitCallExperssion(node: ts.CallExpression) {
    const visitNodeChildren = () => ts.visitEachChild(node, visitor, context);
    if (!shouldReflect(checker, node)) {
      return visitNodeChildren()
    }
    const ctx = createContext(node)
    const fnTypeNode = (node.typeArguments || [])[0]
    if (!fnTypeNode) {
      ctx.reportWarning('is reflective but don\'t have generic type argument, see docs')
      return visitNodeChildren()
    }
    const type = checker.getTypeAtLocation(fnTypeNode);

    const reflectedType = getReflect(ctx).reflectType(type);
    const literal = makeLiteral(reflectedType);

    const newExpression = ts.factory.createCallExpression(node.expression, undefined, [literal])
    return ts.factory.updateCallExpression(node, newExpression, node.typeArguments, ts.visitNodes(node.arguments, visitor))
  }

  function visitDecotaror(node: ts.Decorator) {
    if (!shouldReflect(checker, node)) {
      return node;
    }

    const ctx = createContext(node)

    const classDeclaration = node.parent

    const type = checker.getTypeAtLocation(classDeclaration);

    if (classDeclaration.kind !== ts.SyntaxKind.ClassDeclaration) {
      ctx.reportWarning('cant find decorator\'s class declaration')
      return node
    }
    const reflectedType = getReflect(ctx).reflectClass(<
      ts.InterfaceTypeWithDeclaredMembers
    >type);
    const literal = makeLiteral(reflectedType);

    const newExpression = ts.factory.createCallExpression(node.expression, undefined, [literal]);
    return ts.factory.updateDecorator(node, newExpression);
  }

  function onBeforeVisitNode(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.SourceFile:
      case ts.SyntaxKind.ModuleBlock:
        currentScope = <ScopeType>node;
        break;
    }
  }
  function visitor(node: ts.Node): ts.VisitResult<ts.Node> {
    onBeforeVisitNode(node);
    switch (node.kind) {
      case ts.SyntaxKind.Decorator:
        return visitDecotaror(<ts.Decorator>node);
      case ts.SyntaxKind.CallExpression:
        return visitCallExperssion(<ts.CallExpression>node);
      default:
        return ts.visitEachChild(node, visitor, context);
    }
  }

  function transform(sourceI: ts.SourceFile): ts.SourceFile {
    onNewSourceFile();

    const source = sourceI as tse.SourceFile;
    if (source.isDeclarationFile) {
      return source;
    }
    onBeforeVisitNode(source);
    const newNode = ts.visitEachChild(source, visitor, context);
    newNode.symbol = source.symbol;
    return newNode;
  }
  return transform;
}

export default function TransformerFactory(
  program: ts.Program
): ts.TransformerFactory<ts.SourceFile> {
  return (ctx: ts.TransformationContext) => Transformer(program, ctx);
}
