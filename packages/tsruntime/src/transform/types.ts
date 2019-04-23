import * as ts from "typescript";

import * as Types from "../runtime/publicTypes";
import { TypeKind } from "../runtime/publicTypes";

export { TypeKind };

export type ScopeType =
  | ts.SourceFile
  | ts.CaseBlock
  | ts.ModuleBlock
  | ts.Block;

export class Ctx {
  constructor(
    readonly checker: ts.TypeChecker,
    readonly node: ts.Node,
    readonly currentScope: ScopeType,
    readonly markReferenced: undefined | ((symb: ts.Symbol) => void)
  ) {}

  reportUnknownType = (type: ts.Type) => {
    const { checker } = this;
    const msg = `unknown type, ${checker.typeToString(type)}`;
    this.reportWarning(msg);
  };
  reportWarning = (msg: string) => {
    const { node } = this;
    const fname = node.getSourceFile().fileName;
    const location = node
      .getSourceFile()
      .getLineAndCharacterOfPosition(node.getStart());
    const node_text = node.getText();
    console.warn(
      `\n\ntsruntime: ${msg}: ${fname} ${location.line}:${
        location.character
      }: ${node_text}\n`
    );
  };

  // referencedSet: Set<string>
}

export type ReflectedType =
  | ClassType
  | ObjectType
  | TupleType
  | ReferenceType
  | UnionType
  | Override2<Types.FunctionType>
  | Override2<Types.StringLiteralType>
  | Override2<Types.NumberLiteralType>
  | Override2<Types.SimpleTypes>

type _Override<T, O> = Pick<T, Exclude<keyof T, keyof O>> & O;
type Override<T, O> = _Override<T, O & {initializer?: ts.Expression}>
type Override2<T> = Override<T, {}>

// type Override2<T, O> = T extends {[key: string]: infer R} ? {[key: string]: R extends Types.ReflectedType ? ReflectedType : R}: T


type Properties = Array<{ name: ts.PropertyName; type: ReflectedType }>;
export type ObjectType = Override<
  Types.ObjectType,
  {
    properties: Properties
  }
>;

export type TupleType = Override<
  Types.TupleType,
  {
    elementTypes: ReflectedType[];
  }
>;

export type UnionType = Override<
  Types.UnionType,
  {
    types: ReflectedType[];
  }
>;

export type ReferenceType = Override<
  Types.ReferenceType,
  {
    arguments: ReflectedType[];
  }
>;

export type ClassType = Override<
  Types.ClassType,
  {
    properties: Properties
    extends?: ReflectedType;
  }
>;
