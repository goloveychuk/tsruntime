
import { Types, reflect } from 'tsruntime'
import {expectUnion} from '../utils'

enum NumEnum {
    a,b
}



interface Optional {
    optional?: number     
    optional_boolean?: boolean
    optional_enum?: NumEnum
}

const optionalInterfaceType = reflect<Optional>() as Types.ObjectType;



describe('optional', () => {
    it('optional', ()=> {
        const type = optionalInterfaceType.properties['optional']
        expectUnion(type, {kind: Types.TypeKind.Undefined}, {kind: Types.TypeKind.Number})
    })
    it('optional enum', () => {
        const type = optionalInterfaceType.properties['optional_enum']
        expectUnion(type,
            { kind: Types.TypeKind.Undefined},
            { kind: Types.TypeKind.NumberLiteral, value: 0 },
            { kind: Types.TypeKind.NumberLiteral, value: 1 },
        )
    }),
    it('boolean optional', () => {
        const type = optionalInterfaceType.properties['optional_boolean']
        expectUnion(type, {kind: Types.TypeKind.Undefined}, {kind: Types.TypeKind.Boolean})        
    })
})





describe('other types', () => {
    it('literal array', () => {
        const type = reflect<string[]>()
        expect(type).toEqual({
            kind: Types.TypeKind.Reference,
            type: Array,
            initializer: undefined,
            arguments: [{kind: Types.TypeKind.String}]
        })
    })


    it('tuple', () => {
        const type = reflect<[string, number]>()
        expect(type).toEqual({
            kind: Types.TypeKind.Tuple,
            elementTypes: [{kind: Types.TypeKind.String}, {kind: Types.TypeKind.Number}]
        })
    })
    
})