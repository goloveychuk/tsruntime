import 'reflect-metadata';

export module Types {

  export enum TypeKind {
    String = 1,
    Number = 2,
    Boolean = 3,
    Null = 4,
    Undefined = 5,
    Array = 6,
    Object = 7,
    Reference = 8,
    Union = 9,
    Class = 10
  }



  export type Type =  ArrayType | ObjectType | ClassType | StringType | NumberType | BooleanType | ReferenceType | UnionType | NullType | UndefinedType

  export interface BaseType {
    kind: TypeKind
    initializer?: any //todo
    optional?: boolean
  }

  export interface StringType extends BaseType {
    kind: TypeKind.String
  }

  export interface NumberType extends BaseType {
    kind: TypeKind.Number
  }

  export interface BooleanType extends BaseType {
    kind: TypeKind.Boolean
  }

  export interface NullType extends BaseType {
    kind: TypeKind.Null
  }

  export interface UndefinedType extends BaseType {
    kind: TypeKind.Undefined
  }

  export interface ArrayType extends BaseType {
    kind: TypeKind.Array
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
    props: string[]
    extends?: Types.Type
  }

}


export function Reflective(target: any) {

}

export const MetadataKey = "tsruntime:type"


export function getType(target: Object, propertyKey?: string | symbol): Types.Type {
  let t = maybeGetType(target, propertyKey)
  if (t === undefined) {
    throw new Error(`target is not reflective, ${target}, propKey: ${propertyKey}`)
  }
  return t
}

export function maybeGetType(target: Object, propertyKey?: string | symbol): Types.Type | undefined {
  if (propertyKey === undefined) {
    return Reflect.getMetadata(MetadataKey, target)
  } else {
    return Reflect.getMetadata(MetadataKey, target, propertyKey)
  }
}