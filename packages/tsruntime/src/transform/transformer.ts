import * as ts from "typescript";
import * as tse from "./typescript-extended";
import { REFLECTIVE_KEY } from "../runtime/classUtils";
import { makeLiteral } from "./makeLiteral";
import { getReflect } from "./reflect";
import { Ctx, ScopeType } from "./types";

function getSymbolId(symb: ts.Symbol): number {
  return ((symb as any) as { id: number }).id;
}

function shouldReflectReflectType(
  checker: ts.TypeChecker,
  node: ts.CallExpression
) {
  const symb = checker.getSymbolAtLocation(node.expression);
  if (!symb) {
    return false;
  }

  let origSymb = symb;
  if (symb.flags & ts.SymbolFlags.Alias) {
    origSymb = checker.getAliasedSymbol(symb);
  }

  if (origSymb.getEscapedName() !== "reflect") {
    //TODO change
    return false;
  }
  return true;
}

function getPropertyInMaybeUnion(
  checker: ts.TypeChecker,
  type: ts.Type, propertyName: string) {
  let typesToCheck: ts.Type[]
    if (type.flags & ts.TypeFlags.UnionOrIntersection) {
      typesToCheck = (type as ts.UnionOrIntersectionType).types
    } else {
      typesToCheck = [type]
    }
    // checker.getAugmentedPropertiesOfType(type)
    return typesToCheck.find(type => Boolean(checker.getPropertyOfType(type, propertyName)))
  }

function getReflectiveDecorator(
  checker: ts.TypeChecker,
  node: ts.ClassDeclaration
) {
  return (node.decorators || []).find(dec => {
    if (dec.kind !== ts.SyntaxKind.Decorator) {
      return false;
    }

    const decType = checker.getTypeAtLocation(dec.expression);
    return Boolean(getPropertyInMaybeUnion(checker, decType, REFLECTIVE_KEY));
   
  });
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
    if (!shouldReflectReflectType(checker, node)) {
      return node;
    }

    const argType = checker.getTypeAtLocation(node.typeArguments![0]);

    const reflectedType = getReflect(createContext(node)).reflectType(argType);
    const literal = makeLiteral(reflectedType);

    return literal;
  }

  function visitClassDeclaration(node: tse.ClassDeclaration) {
    const reflectiveDecorator = getReflectiveDecorator(checker, node);
    if (!reflectiveDecorator) {
      return node;
    }
    const type = checker.getTypeAtLocation(node);

    const reflectedType = getReflect(createContext(node)).reflectClass(<
      ts.InterfaceTypeWithDeclaredMembers
    >type);
    const literal = makeLiteral(reflectedType);

    const newDecorators = node.decorators!.map(dec => {
      if (dec !== reflectiveDecorator) {
        return dec;
      }
      const newExpression = ts.createCall(dec.expression, undefined, [literal]);
      return ts.updateDecorator(dec, newExpression);
    });

    const newNode = ts.getMutableClone(node);
    newNode.decorators = ts.createNodeArray(newDecorators);
    return newNode;
    // return node
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
      case ts.SyntaxKind.ClassDeclaration:
        return visitClassDeclaration(<tse.ClassDeclaration>node);
      case ts.SyntaxKind.CallExpression:
        const res = visitCallExperssion(<ts.CallExpression>node);
        return ts.visitEachChild(res, visitor, context);
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
