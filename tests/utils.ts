
import { Types, getPropType as baseGetPropType } from '../src/types'


export function expectUnion(union: Types.UnionType, ...types: Types.Type[])  {
    expect(union.kind).toBe(Types.TypeKind.Union)
    expect(union.types).toEqual(types)
}



export function getPropType(target: Function, propertyKey: string | symbol | number): Types.Type {
    const t = baseGetPropType(target, propertyKey)
    expect(t).toBeDefined()
    return t!
  }