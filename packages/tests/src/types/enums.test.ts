import { Reflective, reflect, getPropType, Types } from 'tsruntime'
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







describe('simple enums', () => {
    it('number enum', () => {
        const type = reflect<NumberEnum>()
        expectUnion(type,
            { kind: Types.TypeKind.NumberLiteral, value: 1 },
            { kind: Types.TypeKind.NumberLiteral, value: 2 }
        )
    })
    it('string enum', () => {
        const type = reflect<StringEnum>()
        expectUnion(type,
            { kind: Types.TypeKind.StringLiteral, value: 'a' },
            { kind: Types.TypeKind.StringLiteral, value: 'b' }
        )
    })
    it('mixed enum', () => {
        const type = reflect<MixedEnum>()
        expectUnion(type,
            { kind: Types.TypeKind.StringLiteral, value: 'a' },
            { kind: Types.TypeKind.NumberLiteral, value: 2 }
        )
    })
    it('default enum', () => {
        const type = reflect<DefaultEnum>()
        expectUnion(type,
            { kind: Types.TypeKind.NumberLiteral, value: 0 },
            { kind: Types.TypeKind.NumberLiteral, value: 1 },
            { kind: Types.TypeKind.NumberLiteral, value: 2 }
        )
    })
})





describe('complex enums', () => {
    it('enum boolean', () => {
        const type = reflect<StringEnum | boolean>()
        expectUnion(type,
            { kind: Types.TypeKind.StringLiteral, value: 'a' },
            { kind: Types.TypeKind.StringLiteral, value: 'b' },
            { kind: Types.TypeKind.Boolean},
        )
    })
    it('enum false', () => {
        const type = reflect<StringEnum | false>()
        expectUnion(type,
            { kind: Types.TypeKind.StringLiteral, value: 'a' },
            { kind: Types.TypeKind.StringLiteral, value: 'b' },
            { kind: Types.TypeKind.FalseLiteral},
        )
    })
    it('enum null', () => {
        const type = reflect<StringEnum | null>()
        expectUnion(type,
            { kind: Types.TypeKind.Null},
            { kind: Types.TypeKind.StringLiteral, value: 'a' },
            { kind: Types.TypeKind.StringLiteral, value: 'b' },
        )
    })
    it('enum undefined', () => {
        const type = reflect<StringEnum | undefined>()
        expectUnion(type,
            { kind: Types.TypeKind.Undefined},
            { kind: Types.TypeKind.StringLiteral, value: 'a' },
            { kind: Types.TypeKind.StringLiteral, value: 'b' },
        )
    })
    it('enums union', () => {
        const type = reflect<StringEnum | NumberEnum>()
        expectUnion(type,
            { kind: Types.TypeKind.NumberLiteral, value: 1 },
            { kind: Types.TypeKind.NumberLiteral, value: 2 },
            { kind: Types.TypeKind.StringLiteral, value: 'a' },
            { kind: Types.TypeKind.StringLiteral, value: 'b' },
        )
    })
})