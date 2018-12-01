
import { ReflectedType, UnionType, TypeKind, getPropType as baseGetPropType } from '../src'


export function expectUnion(union: UnionType, ...types: ReflectedType[])  {
    expect(union.kind).toBe(TypeKind.Union)
    expect(union.types).toEqual(types)
}



export function getPropType(target: Function, propertyKey: string | symbol | number): ReflectedType {
    const t = baseGetPropType(target, propertyKey)
    expect(t).toBeDefined()
    return t!
  }