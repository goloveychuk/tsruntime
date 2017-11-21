
import { Reflective, getType, getPropType, Types } from '../../src/types'

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
        const clsType = getPropType(PrimitiveTypes, "string") as Types.StringType;
        expect(clsType.kind).toBe(Types.TypeKind.String)
    });
    it('number', () => {
        const clsType = getPropType(PrimitiveTypes, "number") as Types.NumberType;
        expect(clsType.kind).toBe(Types.TypeKind.Number)
    });
    it('any', () => {
        const clsType = getPropType(PrimitiveTypes, "any") as Types.AnyType;
        expect(clsType.kind).toBe(Types.TypeKind.Any)
    });
    it('undefined', () => {
        const clsType = getPropType(PrimitiveTypes, "undefined") as Types.UndefinedType;
        expect(clsType.kind).toBe(Types.TypeKind.Undefined)
    });
    it('null', () => {
        const clsType = getPropType(PrimitiveTypes, "null") as Types.NullType;
        expect(clsType.kind).toBe(Types.TypeKind.Null)
    });
    it('void', () => {
        const clsType = getPropType(PrimitiveTypes, "void") as Types.VoidType;
        expect(clsType.kind).toBe(Types.TypeKind.Void)
    });
    it('never', () => {
        const clsType = getPropType(PrimitiveTypes, "never") as Types.NeverType;
        expect(clsType.kind).toBe(Types.TypeKind.Never)
    });
    it('symbol', () => {
        const clsType = getPropType(PrimitiveTypes, "symbol") as Types.ESSymbolType;
        expect(clsType.kind).toBe(Types.TypeKind.ESSymbol)
    });
})
