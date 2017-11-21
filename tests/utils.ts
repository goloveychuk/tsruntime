
import { Types } from '../src/types'


export function expectUnion(union: Types.UnionType, ...types: Types.Type[])  {
    expect(union.kind).toBe(Types.TypeKind.Union)
    expect(union.types).toEqual(types)
}
