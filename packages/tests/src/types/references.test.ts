import { Types, reflect } from 'tsruntime'


class GenericCls<T> {

}

class Cls {

}


describe('reference types', () => {

    it('ref array', () => {
        const type = reflect<Array<string>>()
        expect(type).toEqual({
            kind: Types.TypeKind.Reference,
            type: Array,
            initializer: undefined,
            arguments: [{kind: Types.TypeKind.String}]
        })
    })

    it('ref string', () => {
        const type = reflect<String>()
        expect(type).toEqual({
            kind: Types.TypeKind.Reference,
            type: String,
            initializer: undefined,
            arguments: []
        })
    })

    it('cls ref', () => {
        const type = reflect<Cls>()
        expect(type).toEqual({
            kind: Types.TypeKind.Reference,
            type: Cls,
            initializer: undefined,
            arguments: []
        })
    })

    it('gen cls ref', () => {
        const type = reflect<GenericCls<string>>()
        expect(type).toEqual({
            kind: Types.TypeKind.Reference,
            type: GenericCls,
            initializer: undefined,
            arguments: [{kind: Types.TypeKind.String}]
        })
    })
})