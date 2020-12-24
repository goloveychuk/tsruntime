import {Types} from 'tsruntime'


export function expectUnion(union: Types.ReflectedType, ...types: Types.ReflectedType[])  {
    expect(union.kind).toBe(Types.TypeKind.Union)
    union = union as Types.UnionType
    expect(union.types).toEqual(types)
}

export function initializerIsEqual(type: Types.ReflectedType, val: any) {
    expect(type.initializer).not.toBe(undefined);
    expect(type.initializer!()).toEqual(val);
}
