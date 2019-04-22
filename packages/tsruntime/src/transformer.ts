import * as ts from "typescript";
import * as tse from "./typescript-extended";
import { MetadataKey, REFLECTIVE_KEY } from "./utils";
import { makeLiteral } from "./makeLiteral";
import { reflectType } from "./reflect";
import { Ctx, ScopeType } from "./types";

function getSymbolId(symb: ts.Symbol): number {
  return ((symb as any) as { id: number }).id;
}

function shouldReflectReflectType(checker: ts.TypeChecker, node: ts.CallExpression) {
  const symb = checker.getSymbolAtLocation(node.expression);
  if (!symb) {
    return false;
  }

  let origSymb = symb
  if (symb.flags & ts.SymbolFlags.Alias) {
    origSymb = checker.getAliasedSymbol(symb);
  }

  if (origSymb.getEscapedName() !== "reflect") { //TODO change
    return false;
  }
  return true
}

function Transformer(program: ts.Program, context: ts.TransformationContext) {
  // let ReferencedSet = new Set<number>()

  let currentScope: ScopeType;

  const checker = program.getTypeChecker();

  function visitCallExperssion(node: ts.CallExpression) {
    if (!shouldReflectReflectType(checker, node)) {
      return node;
    }
    const ctx = new Ctx(checker, node, currentScope);

    const argType = checker.getTypeAtLocation(node.typeArguments![0]);

    const reflectedType = reflectType(argType, ctx);
    const literal = makeLiteral(reflectedType);

    return literal;
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
      case ts.SyntaxKind.CallExpression:
        const res = visitCallExperssion(<ts.CallExpression>node);
        return ts.visitEachChild(res, visitor, context);
      default:
        return ts.visitEachChild(node, visitor, context);
    }
  }

  function transform(sourceI: ts.SourceFile): ts.SourceFile {
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
