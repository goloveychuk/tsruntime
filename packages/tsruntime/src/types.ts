import * as ts from "typescript";

import * as Types from "./publicTypes";
import {TypeKind} from "./publicTypes";

export {TypeKind}

export type ScopeType = ts.SourceFile | ts.CaseBlock | ts.ModuleBlock | ts.Block;

export class Ctx {
  constructor(readonly checker: ts.TypeChecker, readonly node: ts.Node, readonly currentScope: ScopeType, readonly markReferenced?: (symb: ts.Symbol)=>void) {}

  reportUnknownType = (type: ts.Type) => {
    const { checker} = this;
    const msg = `unknown type, ${checker.typeToString(type)}`
    this.reportWarning(msg)
  }
  reportWarning = (msg: string) => {
    const {node} = this;
    const fname = node.getSourceFile().fileName;
    const location = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());
    const node_text = node.getText();
    console.warn(`\n\ntsruntime: ${msg}: ${fname} ${location.line}:${location.character}: ${node_text}\n`);
  }

  // referencedSet: Set<string>
}



export type ReflectedType =
  | ClassType
  | InterfaceType
  | TupleType
  | ReferenceType
  | UnionType
  | Types.StringLiteralType
  | Types.NumberLiteralType
  | Types.ObjectType
  | Types.SimpleType;

type Override<T, O> = Pick<T, Exclude<keyof T, keyof O>> & O

export interface InterfaceType extends Types.BaseType {
  kind: TypeKind.Interface;
  name: string;
  arguments: ReflectedType[];
}

export interface TupleType extends Types.BaseType {
  kind: TypeKind.Tuple;
  elementTypes: ReflectedType[];
}

export interface UnionType extends Types.BaseType {
  kind: TypeKind.Union;
  types: ReflectedType[];
}
export interface ReferenceType extends Types.BaseType {
  kind: TypeKind.Reference;
  type: ts.Identifier;
  arguments: ReflectedType[];
}

export interface ClassType extends Types.BaseType {
  kind: TypeKind.Class;
  name: string;
  props: ts.PropertyName[];
  extends?: ReflectedType;
}
