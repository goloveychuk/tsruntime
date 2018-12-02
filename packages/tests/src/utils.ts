
import { Types, getPropType as baseGetPropType } from 'tsruntime'


export function expectUnion(union: Types.ReflectedType, ...types: Types.ReflectedType[])  {
    expect(union.kind).toBe(Types.TypeKind.Union)
    union = union as Types.UnionType
    expect(union.types).toEqual(types)
}



export function getPropType(target: Function, propertyKey: string | symbol | number): Types.ReflectedType {
    const t = baseGetPropType(target, propertyKey)
    expect(t).toBeDefined()
    return t!
  }