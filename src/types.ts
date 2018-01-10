import 'reflect-metadata';

export module Types {

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

    Unknown = 999
  }




  export type Type = InterfaceType | TupleType |
    ObjectType | ClassType | ReferenceType | UnionType |
    StringLiteralType | NumberLiteralType | SimpleType;

  export interface SimpleType extends BaseType {
    kind: TypeKind.String | TypeKind.Number | TypeKind.Boolean | TypeKind.Null | TypeKind.Undefined | TypeKind.ESSymbol |
    TypeKind.Void | TypeKind.Never | TypeKind.Any | TypeKind.FalseLiteral | TypeKind.TrueLiteral | Types.TypeKind.Unknown
  }

  export interface BaseType {
    kind: TypeKind
    initializer?: any //todo
  }


  export interface InterfaceType extends BaseType {
    kind: TypeKind.Interface
    name: string
    arguments: Type[]
  }


  export interface TupleType extends BaseType {
    kind: TypeKind.Tuple
    elementTypes: Type[]
  }


  export interface StringLiteralType extends BaseType {
    kind: TypeKind.StringLiteral
    value: string
  }
  export interface NumberLiteralType extends BaseType {
    kind: TypeKind.NumberLiteral
    value: number
  }

  export interface ObjectType extends BaseType {
    kind: TypeKind.Object
  }

  export interface UnionType extends BaseType {
    kind: TypeKind.Union
    types: Type[]
  }
  export interface ReferenceType extends BaseType {
    kind: TypeKind.Reference
    type: any
    arguments: Type[]
  }

  export interface ClassType extends BaseType {
    kind: TypeKind.Class
    name: string
    props: (string | number)[]
    extends?: Types.Type
  }

}


export const REFLECTIVE_KEY = '__is_ts_runtime_reflective_decorator'

type ReflectiveDecorator<T> = T
export function ReflectiveFactory<T>(fn: T) {
  return fn as T & { __is_ts_runtime_reflective_decorator: boolean }
}


export const Reflective = ReflectiveFactory(function (target: any) {

})



export const MetadataKey = "tsruntime:type"


export function getType(target: Function): Types.Type | undefined {
  return Reflect.getMetadata(MetadataKey, target)
}

export function mustGetType(target: Function): Types.Type {
  const type = getType(target)
  if (type === undefined) {
    throw new Error("can't find type")
  }
  return type
}



export function mustGetPropType(target: Function, propertyKey: string | symbol): Types.Type {
  const type = getPropType(target, propertyKey)
  if (type === undefined) {
    throw new Error("can't find prop type")
  }
  return type
}



export function getPropType(target: Function, propertyKey: string | symbol): Types.Type | undefined {
  return Reflect.getMetadata(MetadataKey, target.prototype, propertyKey)
}