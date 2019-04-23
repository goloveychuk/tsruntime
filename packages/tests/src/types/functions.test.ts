import { reflect, Types } from 'tsruntime'



describe('functions', () => {
    it('simple closure', () => {
        const type = reflect<(b: string)=>void>()
        expect(type).toEqual({kind: Types.TypeKind.Function})
    })
    
})



