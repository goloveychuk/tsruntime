export enum ModifierFlags {
  None = 0,
  Public = 1,
  Private = 2,
  Protected = 4,
  Readonly = 8,
  Override = 16,
  Export = 32,
  Abstract = 64,
  Ambient = 128,
  Static = 256,
  Accessor = 512,
  Async = 1024,
  Default = 2048,
  Const = 4096,
  In = 8192,
  Out = 16384,
  Decorator = 32768,
  Deprecated = 65536,
  HasComputedJSDocModifiers = 268435456,
  HasComputedFlags = 536870912,
  AccessibilityModifier = 7,
  ParameterPropertyModifier = 31,
  NonPublicAccessibilityModifier = 6,
  TypeScriptModifier = 28895,
  ExportDefault = 2080,
  All = 131071,
  Modifier = 98303,
}

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
  modifiers?: ModifierFlags;
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
