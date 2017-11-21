import { Reflective, getType, getPropType, Types } from '../../src/types'
import { expectUnion } from '../utils'

enum NumberEnum {
    a = 1,
    b
}

enum StringEnum {
    a = 'a',
    b = 'b'
}

enum MixedEnum {
    a = 'a',
    b = 2
}

enum DefaultEnum {
    a, b, c
}


@Reflective
class SimpleEnums {
    numberEnum: NumberEnum
    stringEnum: StringEnum
    mixedEnum: MixedEnum
    defaultEnum: DefaultEnum
}







describe('simple enums', () => {
    it('number enum', () => {
        const type = getPropType(SimpleEnums, "numberEnum") as Types.UnionType;
        expectUnion(type,
            { kind: Types.TypeKind.NumberLiteral, value: 1 },
            { kind: Types.TypeKind.NumberLiteral, value: 2 }
        )
    })
    it('string enum', () => {
        const stringEnum = getPropType(SimpleEnums, "stringEnum") as Types.UnionType;
        expectUnion(stringEnum,
            { kind: Types.TypeKind.StringLiteral, value: 'a' },
            { kind: Types.TypeKind.StringLiteral, value: 'b' }
        )
    })
    it('mixed enum', () => {
        const mixedEnum = getPropType(SimpleEnums, "mixedEnum") as Types.UnionType;
        expectUnion(mixedEnum,
            { kind: Types.TypeKind.StringLiteral, value: 'a' },
            { kind: Types.TypeKind.NumberLiteral, value: 2 }
        )
    })
    it('default enum', () => {
        const defaultEnum = getPropType(SimpleEnums, "defaultEnum") as Types.UnionType;
        expectUnion(defaultEnum,
            { kind: Types.TypeKind.NumberLiteral, value: 0 },
            { kind: Types.TypeKind.NumberLiteral, value: 1 },
            { kind: Types.TypeKind.NumberLiteral, value: 2 }
        )
    })
})



@Reflective
class ComplexEnums {
    enumBoolean: StringEnum | boolean
    enumFalse: StringEnum | false
    enumNull: StringEnum | null
    enumUndefined: StringEnum | undefined
    optionalEnum?: StringEnum
    enumsUnion: StringEnum | NumberEnum
}


describe('complex enums', () => {
    it('enum boolean', () => {
        const type = getPropType(ComplexEnums, "enumBoolean") as Types.UnionType;
        expectUnion(type,
            { kind: Types.TypeKind.StringLiteral, value: 'a' },
            { kind: Types.TypeKind.StringLiteral, value: 'b' },
            { kind: Types.TypeKind.Boolean},
        )
    })
    it('enum false', () => {
        const type = getPropType(ComplexEnums, "enumFalse") as Types.UnionType;
        expectUnion(type,
            { kind: Types.TypeKind.StringLiteral, value: 'a' },
            { kind: Types.TypeKind.StringLiteral, value: 'b' },
            { kind: Types.TypeKind.FalseLiteral},
        )
    })
    it('enum null', () => {
        const type = getPropType(ComplexEnums, "enumNull") as Types.UnionType;
        expectUnion(type,
            { kind: Types.TypeKind.Null},
            { kind: Types.TypeKind.StringLiteral, value: 'a' },
            { kind: Types.TypeKind.StringLiteral, value: 'b' },
        )
    })
    it('enum undefined', () => {
        const type = getPropType(ComplexEnums, "enumUndefined") as Types.UnionType;
        expectUnion(type,
            { kind: Types.TypeKind.Undefined},
            { kind: Types.TypeKind.StringLiteral, value: 'a' },
            { kind: Types.TypeKind.StringLiteral, value: 'b' },
        )
    })
    it('optional enum', () => {
        const type = getPropType(ComplexEnums, "optionalEnum") as Types.UnionType;
        expectUnion(type,
            { kind: Types.TypeKind.Undefined},
            { kind: Types.TypeKind.StringLiteral, value: 'a' },
            { kind: Types.TypeKind.StringLiteral, value: 'b' },
        )
    })
    it('enums union', () => {
        const type = getPropType(ComplexEnums, "enumsUnion") as Types.UnionType;
        expectUnion(type,
            { kind: Types.TypeKind.NumberLiteral, value: 1 },
            { kind: Types.TypeKind.NumberLiteral, value: 2 },
            { kind: Types.TypeKind.StringLiteral, value: 'a' },
            { kind: Types.TypeKind.StringLiteral, value: 'b' },
        )
    })
})