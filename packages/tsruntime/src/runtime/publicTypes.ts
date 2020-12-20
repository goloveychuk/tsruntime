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
  Class,
  Unknown,

  Function,

  Unknown2 = 999
}

export enum ModifierFlags {
  None = 0,
  Export = 1,
  Ambient = 2,
  Public = 4,
  Private = 8,
  Protected = 16,
  Static = 32,
  Readonly = 64,
  Abstract = 128,
  Async = 256,
  Default = 512,
  Const = 2048,
  HasComputedFlags = 536870912,
  AccessibilityModifier = 28,
  ParameterPropertyModifier = 92,
  NonPublicAccessibilityModifier = 24,
  TypeScriptModifier = 2270,
  ExportDefault = 513,
  All = 3071
}

export type StringType = BaseType<TypeKind.String, string>;
export type NumberType = BaseType<TypeKind.Number, number>;
export type BooleanType = BaseType<TypeKind.Boolean, boolean>;
export type NullType = BaseType<TypeKind.Null, null>;
export type UndefinedType = BaseType<TypeKind.Undefined, undefined>;
export type ESSymbolType = BaseType<TypeKind.ESSymbol, Symbol>;
export type VoidType = BaseType<TypeKind.Void, void>;
export type NeverType = BaseType<TypeKind.Never, never>;
export type AnyType = BaseType<TypeKind.Any, any>;
export type FalseLiteralType = BaseType<TypeKind.FalseLiteral, false>;
export type TrueLiteralType = BaseType<TypeKind.TrueLiteral, true>;
export type UnknownType = BaseType<TypeKind.Unknown, unknown>;
export type Unknown2Type = BaseType<TypeKind.Unknown2, unknown>;

export type SimpleTypes =
  | StringType
  | NumberType
  | BooleanType
  | NullType
  | UndefinedType
  | ESSymbolType
  | VoidType
  | NeverType
  | AnyType
  | FalseLiteralType
  | TrueLiteralType
  | UnknownType
  | Unknown2Type;

  

export type ReflectedType =
  | ObjectType
  | TupleType
  | ClassType
  | ReferenceType
  | UnionType
  | StringLiteralType
  | FunctionType
  | NumberLiteralType
  | SimpleTypes;

export interface BaseType<TKind extends TypeKind, T> {
  kind: TKind;
  initializer?: () => T;
}

export interface ObjectType extends BaseType<TypeKind.Object, unknown> {
  name?: string;
  properties: { [key: string]: ReflectedType };
}

export interface FunctionType extends BaseType<TypeKind.Function, Function> {

}

export interface TupleType extends BaseType<TypeKind.Tuple, unknown[]> {
  elementTypes: ReflectedType[];
}

export interface StringLiteralType
  extends BaseType<TypeKind.StringLiteral, string> {
  value: string;
}
export interface NumberLiteralType
  extends BaseType<TypeKind.NumberLiteral, number> {
  value: number;
}

export interface UnionType extends BaseType<TypeKind.Union, unknown> {
  types: ReflectedType[];
}
export interface ReferenceType extends BaseType<TypeKind.Reference, any> {
  type: any;
  arguments: ReflectedType[];
}

export interface ConstructorParameter {
  name: string;
  modifiers: ModifierFlags;
  type: ReflectedType;
}

export interface Constructor {
  modifiers: ModifierFlags;
  parameters: ConstructorParameter[];
}

export type Constructors = Array<Constructor>;

export interface ClassType extends BaseType<TypeKind.Class, never> {
  //TODO think about references vs class
  name: string;
  properties: { [key: string]: ReflectedType };
  constructors: Constructors;
  extends?: ReflectedType;
}
