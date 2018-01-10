import { Reflective, getType, Types } from '../../src/types'
import {expectUnion, getPropType} from '../utils'





@Reflective
class BooleanTypes {
    boolean_undefined: boolean | undefined
    optional_boolean?: boolean
    boolean_null: boolean | null

    true_false: false | true
    true_false_boolean: false | true | boolean
    true_false_boolean_number: false | true | boolean | number
    false: false
    true: true
    false_number: false | number
    true_number: true | number
}




describe('booleans', () => {
    it('boolean undefined', () => {
        const type = getPropType(BooleanTypes, "boolean_undefined") as Types.UnionType
        expectUnion(type, {kind: Types.TypeKind.Undefined}, {kind: Types.TypeKind.Boolean})
    })
    it('boolean optional', () => {
        const type = getPropType(BooleanTypes, "optional_boolean") as Types.UnionType
        expectUnion(type, {kind: Types.TypeKind.Undefined}, {kind: Types.TypeKind.Boolean})        
    })
    it('boolean null', () => {
        const type = getPropType(BooleanTypes, "boolean_null") as Types.UnionType
        expectUnion(type, {kind: Types.TypeKind.Null}, {kind: Types.TypeKind.Boolean})        
    })
    it('true false', () => {
        const type = getPropType(BooleanTypes, "true_false")
        expect(type.kind).toBe(Types.TypeKind.Boolean)
    })
    it('true false boolean', () => {
        const type = getPropType(BooleanTypes, "true_false_boolean")
        expect(type.kind).toBe(Types.TypeKind.Boolean)
    })
    it('true false boolean number', () => {
        const type = getPropType(BooleanTypes, "true_false_boolean_number") as Types.UnionType
        expectUnion(type, {kind: Types.TypeKind.Number}, {kind: Types.TypeKind.Boolean})        
    })
    it('false', () => {
        const type = getPropType(BooleanTypes, "false")
        expect(type.kind).toBe(Types.TypeKind.FalseLiteral)
    })
    it('true', () => {
        const type = getPropType(BooleanTypes, "true")
        expect(type.kind).toBe(Types.TypeKind.TrueLiteral)
    })
    it('false number', () => {
        const type = getPropType(BooleanTypes, "false_number") as Types.UnionType
        expectUnion(type, {kind: Types.TypeKind.Number}, {kind: Types.TypeKind.FalseLiteral})        
    })
    it('true number', () => {
        const type = getPropType(BooleanTypes, "true_number") as Types.UnionType
        expectUnion(type, {kind: Types.TypeKind.Number}, {kind: Types.TypeKind.TrueLiteral})     
    });
})
