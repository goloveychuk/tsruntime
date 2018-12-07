import { Reflective, getType, Types } from 'tsruntime'
import {expectUnion, getPropType} from '../utils'


class GenericCls<T> {

}

class Cls {

}

enum SomeEnum {
    a,
    b
}

@Reflective
class DerrivedTypes {
    string = "string"
    number = 42
    true = false
    false = true
    null = null
    undefined = undefined


    array = ['string']    
    refArray = Array<string>()
    ref = new Cls()
    genRef = new GenericCls<string>()

    enum = SomeEnum.a
}


describe.skip('class defaults types', () => {
    it('string', () => {
        const type = getPropType(DerrivedTypes, "string")
        expect(type.kind).toBe(Types.TypeKind.String)
    })
    it('number', () => {
        const type = getPropType(DerrivedTypes, "number")
        expect(type.kind).toBe(Types.TypeKind.Number)
    })
    it('true', () => {
        const type = getPropType(DerrivedTypes, "true")
        expect(type.kind).toBe(Types.TypeKind.Boolean)
    })
    it('false', () => {
        const type = getPropType(DerrivedTypes, "false")
        expect(type.kind).toBe(Types.TypeKind.Boolean)
    })
    it('null', () => {
        const type = getPropType(DerrivedTypes, "null")
        expect(type.kind).toBe(Types.TypeKind.Null)
    })
    it('undefined', () => {
        const type = getPropType(DerrivedTypes, "undefined")
        expect(type.kind).toBe(Types.TypeKind.Undefined)
    })
    
    it('array', () => {
        const type = getPropType(DerrivedTypes, "array") as Types.ReferenceType;
        expect(type.kind).toBe(Types.TypeKind.Reference)
        expect(type.type).toBe(Array)
        expect(type.initializer).not.toBe(undefined)
        expect(type.initializer()).toEqual(['string'])
        expect(type.arguments).toEqual([{kind: Types.TypeKind.String}])
    })
    it('ref array', () => {
        const type = getPropType(DerrivedTypes, "refArray") as Types.ReferenceType;
        expect(type.kind).toBe(Types.TypeKind.Reference)
        expect(type.type).toBe(Array)
        expect(type.initializer).not.toBe(undefined)
        expect(type.initializer()).toEqual([])
        expect(type.arguments).toEqual([{kind: Types.TypeKind.String}])
    })
    it('ref', () => {
        const type = getPropType(DerrivedTypes, "ref") as Types.ReferenceType;
        expect(type.kind).toBe(Types.TypeKind.Reference)
        expect(type.type).toBe(Cls)
        expect(type.initializer).not.toBe(undefined)
        expect(type.arguments).toEqual([])
    })
    it('gen ref', () => {
        const type = getPropType(DerrivedTypes, "genRef") as Types.ReferenceType;
        expect(type.kind).toBe(Types.TypeKind.Reference)
        expect(type.type).toBe(GenericCls)
        expect(type.initializer).not.toBe(undefined)
        expect(type.arguments).toEqual([{kind: Types.TypeKind.String}])
    })

    it('enum', () => {
        const type = getPropType(DerrivedTypes, "enum") as Types.UnionType;
        expectUnion(type, 
            {kind: Types.TypeKind.NumberLiteral, value: 0},
            {kind: Types.TypeKind.NumberLiteral, value: 1},
        )
    })
})