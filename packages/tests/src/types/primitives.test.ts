
import { Reflective, getType, Types, reflect } from 'tsruntime'
import {getPropType} from '../utils'





describe('primitive types', () => {
    it('string', () => {
        const clsType = reflect<string>()
        expect(clsType.kind).toBe(Types.TypeKind.String)
    });
    it('number', () => {
        const clsType = reflect<number>()
        expect(clsType.kind).toBe(Types.TypeKind.Number)
    });
    it('any', () => {
        const clsType = reflect<any>()
        expect(clsType.kind).toBe(Types.TypeKind.Any)
    });
    it('undefined', () => {
        const clsType = reflect<undefined>()
        expect(clsType.kind).toBe(Types.TypeKind.Undefined)
    });
    it('null', () => {
        const clsType = reflect<null>()
        expect(clsType.kind).toBe(Types.TypeKind.Null)
    });
    it('void', () => {
        const clsType = reflect<void>()
        expect(clsType.kind).toBe(Types.TypeKind.Void)
    });
    it('never', () => {
        const clsType = reflect<never>()
        expect(clsType.kind).toBe(Types.TypeKind.Never)
    });
    it('symbol', () => {
        const clsType = reflect<symbol>()
        expect(clsType.kind).toBe(Types.TypeKind.ESSymbol)
    });
    it('unknown', () => {
        const clsType = reflect<unknown>()
        expect(clsType.kind).toBe(Types.TypeKind.Unknown)
    });
})
