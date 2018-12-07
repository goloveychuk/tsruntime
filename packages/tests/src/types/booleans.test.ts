import { Reflective, getType, Types, reflect } from 'tsruntime'
import {expectUnion, getPropType} from '../utils'




describe('booleans', () => {
    it('boolean undefined', () => {
        const type = reflect<boolean | undefined>()
        expectUnion(type, {kind: Types.TypeKind.Undefined}, {kind: Types.TypeKind.Boolean})
    })
    it('boolean null', () => {
        const type = reflect<boolean | null>()
        expectUnion(type, {kind: Types.TypeKind.Null}, {kind: Types.TypeKind.Boolean})        
    })
    it('true false', () => {
        const type = reflect<true | false>()
        expect(type.kind).toBe(Types.TypeKind.Boolean)
    })
    it('true false boolean', () => {
        const type = reflect<false | true | boolean>()
        expect(type.kind).toBe(Types.TypeKind.Boolean)
    })
    it('true false boolean number', () => {
        const type = reflect<false | true | boolean | number>()
        expectUnion(type, {kind: Types.TypeKind.Number}, {kind: Types.TypeKind.Boolean})        
    })
    it('false', () => {
        const type = reflect<false>()
        expect(type.kind).toBe(Types.TypeKind.FalseLiteral)
    })
    it('true', () => {
        const type = reflect<true>()
        expect(type.kind).toBe(Types.TypeKind.TrueLiteral)
    })
    it('false number', () => {
        const type = reflect<false | number>()
        expectUnion(type, {kind: Types.TypeKind.Number}, {kind: Types.TypeKind.FalseLiteral})        
    })
    it('true number', () => {
        const type = reflect<true | number>()
        expectUnion(type, {kind: Types.TypeKind.Number}, {kind: Types.TypeKind.TrueLiteral})     
    });
})
