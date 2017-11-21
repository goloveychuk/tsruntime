
import { Reflective, getType, getPropType, Types } from '../../src/types'
import {expectUnion} from '../utils'

@Reflective
class OtherTypes {
    array: string[]
    tuple: [string, number]
    optional?: number     
}




describe('other types', () => {
    it('literal array', () => {
        const type = getPropType(OtherTypes, "array") as Types.ReferenceType;
        expect(type.kind).toBe(Types.TypeKind.Reference)
        expect(type.type).toBe(Array)
        expect(type.initializer).toBe(undefined)
        expect(type.arguments).toEqual([{ kind: Types.TypeKind.String }])
    })
    it('tuple', () => {
        const type = getPropType(OtherTypes, "tuple") as Types.TupleType;
        expect(type.kind).toBe(Types.TypeKind.Tuple)
        expect(type.elementTypes).toEqual([{kind: Types.TypeKind.String}, {kind: Types.TypeKind.Number}])
    })
    it('optional', ()=> {
        const type = getPropType(OtherTypes, "optional") as Types.UnionType;
        expectUnion(type, {kind: Types.TypeKind.Undefined}, {kind: Types.TypeKind.Number})
    })
})