import { Reflective, getType, getPropType, Types } from '../../src/types'


class GenericCls<T> {

}

class Cls {

}

@Reflective
class ReferenceTypes {
    refArray: Array<string>
    refString: String
    refNumber: Number
    refDate: Date
    clsRef: Cls
    genRef: GenericCls<string>
}


describe('reference types', () => {

    it('ref array', () => {
        const type = getPropType(ReferenceTypes, "refArray") as Types.ReferenceType;
        expect(type.kind).toBe(Types.TypeKind.Reference)
        expect(type.type).toBe(Array)
        expect(type.initializer).toBe(undefined)
        expect(type.arguments).toEqual([{ kind: Types.TypeKind.String }])
    })

    it('ref string', () => {
        const type = getPropType(ReferenceTypes, "refString") as Types.ReferenceType;
        expect(type.kind).toBe(Types.TypeKind.Reference)
        expect(type.type).toBe(String)
        expect(type.initializer).toBe(undefined)
        expect(type.arguments).toEqual([])
    })
    it('ref number', () => {
        const type = getPropType(ReferenceTypes, "refNumber") as Types.ReferenceType;
        expect(type.kind).toBe(Types.TypeKind.Reference)
        expect(type.type).toBe(Number)
        expect(type.initializer).toBe(undefined)
        expect(type.arguments).toEqual([])
    })
    it('ref date', () => {
        const type = getPropType(ReferenceTypes, "refDate") as Types.ReferenceType;
        expect(type.kind).toBe(Types.TypeKind.Reference)
        expect(type.type).toBe(Date)
        expect(type.initializer).toBe(undefined)
        expect(type.arguments).toEqual([])
    })
    it('cls ref', () => {
        const type = getPropType(ReferenceTypes, "clsRef") as Types.ReferenceType;
        expect(type.kind).toBe(Types.TypeKind.Reference)
        expect(type.type).toBe(Cls)
        expect(type.initializer).toBe(undefined)
        expect(type.arguments).toEqual([])
    })
    it('gen cls ref', () => {
        const type = getPropType(ReferenceTypes, "genRef") as Types.ReferenceType;
        expect(type.kind).toBe(Types.TypeKind.Reference)
        expect(type.type).toBe(GenericCls)
        expect(type.initializer).toBe(undefined)
        expect(type.arguments).toEqual([{kind: Types.TypeKind.String}])
    })
})