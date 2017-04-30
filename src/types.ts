import 'reflect-metadata';

export module Types {

  export enum TypeKind {
    String = 1,
    Number = 2,
    Boolean = 3,
    Null = 4,
    Undefined = 5,
    Reference = 6,
    Union = 7,
    Class = 8
  }



  export type Type =  ClassType | StringType | NumberType | BooleanType | ReferenceType | UnionType | NullType | UndefinedType

  

  export interface StringType {
    kind: TypeKind.String
  }

  export interface NumberType {
    kind: TypeKind.Number
  }

  export interface BooleanType {
    kind: TypeKind.Boolean
  }

  export interface NullType {
    kind: TypeKind.Null
  }

  export interface UndefinedType {
    kind: TypeKind.Undefined
  }


  export interface UnionType {
    kind: TypeKind.Union
    types: Type[]
  }
  export interface ReferenceType {
    kind: TypeKind.Reference
    type: any
    arguments: Type[]
  }

  export interface ClassType {
    kind: TypeKind.Class
    props: string[]
    extends?: Types.Type
  }

}


export function Reflective(target: any) {

}

export const MetadataKey = "typscript-reflect:type"


export function getType(target: Object, propertyKey: string | symbol): Types.Type | undefined {
  return Reflect.getMetadata(MetadataKey, target, propertyKey)
}