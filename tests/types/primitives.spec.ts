
import { Reflective, getType, Types } from '../../src/types'
import {getPropType} from '../utils'

@Reflective
class PrimitiveTypes {
    string: string
    number: number
    any: any
    undefined: undefined
    null: null
    void: void
    never: never
    symbol: symbol
}




describe('primitive types', () => {
    it('string', () => {
        const clsType = getPropType(PrimitiveTypes, "string")
        expect(clsType.kind).toBe(Types.TypeKind.String)
    });
    it('number', () => {
        const clsType = getPropType(PrimitiveTypes, "number")
        expect(clsType.kind).toBe(Types.TypeKind.Number)
    });
    it('any', () => {
        const clsType = getPropType(PrimitiveTypes, "any")
        expect(clsType.kind).toBe(Types.TypeKind.Any)
    });
    it('undefined', () => {
        const clsType = getPropType(PrimitiveTypes, "undefined")
        expect(clsType.kind).toBe(Types.TypeKind.Undefined)
    });
    it('null', () => {
        const clsType = getPropType(PrimitiveTypes, "null")
        expect(clsType.kind).toBe(Types.TypeKind.Null)
    });
    it('void', () => {
        const clsType = getPropType(PrimitiveTypes, "void")
        expect(clsType.kind).toBe(Types.TypeKind.Void)
    });
    it('never', () => {
        const clsType = getPropType(PrimitiveTypes, "never")
        expect(clsType.kind).toBe(Types.TypeKind.Never)
    });
    it('symbol', () => {
        const clsType = getPropType(PrimitiveTypes, "symbol")
        expect(clsType.kind).toBe(Types.TypeKind.ESSymbol)
    });
})
