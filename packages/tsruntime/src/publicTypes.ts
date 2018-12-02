export enum TypeKind {
  Any = 1,
  String,
  Number,
  Boolean,
  StringLiteral,
  NumberLiteral,
  FalseLiteral,
  TrueLiteral,
  EnumLiteral,
  ESSymbol,
  Void,
  Undefined,
  Null,
  Never,

  Object,

  Tuple,
  Union,
  Reference,
  Interface,
  Class,
  Unknown,

  Unknown2=999
}

export type ReflectedType =
  | InterfaceType
  | TupleType
  | ObjectType
  | ClassType
  | ReferenceType
  | UnionType
  | StringLiteralType
  | NumberLiteralType
  | SimpleType;

export interface SimpleType extends BaseType {
  kind:
    | TypeKind.String
    | TypeKind.Number
    | TypeKind.Boolean
    | TypeKind.Null
    | TypeKind.Undefined
    | TypeKind.ESSymbol
    | TypeKind.Void
    | TypeKind.Never
    | TypeKind.Any
    | TypeKind.FalseLiteral
    | TypeKind.TrueLiteral
    | TypeKind.Unknown
    | TypeKind.Unknown2;
}

export interface BaseType {
  kind: TypeKind;
  initializer?: any; //todo
}

export interface InterfaceType extends BaseType {
  kind: TypeKind.Interface;
  name: string;
  arguments: ReflectedType[];
  properties: {[key: string]: ReflectedType}
}

export interface TupleType extends BaseType {
  kind: TypeKind.Tuple;
  elementTypes: ReflectedType[];
}

export interface StringLiteralType extends BaseType {
  kind: TypeKind.StringLiteral;
  value: string;
}
export interface NumberLiteralType extends BaseType {
  kind: TypeKind.NumberLiteral;
  value: number;
}

export interface ObjectType extends BaseType {
  kind: TypeKind.Object;
}

export interface UnionType extends BaseType {
  kind: TypeKind.Union;
  types: ReflectedType[];
}
export interface ReferenceType extends BaseType {
  kind: TypeKind.Reference;
  type: any;
  arguments: ReflectedType[];
}

export interface ClassType extends BaseType {
  kind: TypeKind.Class;
  name: string;
  props: (string | number)[];
  extends?: ReflectedType;
}
