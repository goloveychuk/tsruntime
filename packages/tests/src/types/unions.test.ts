
import { Types, reflect } from 'tsruntime'
import { expectUnion } from '../utils'












describe('union types', () => {
    it('string | null', () => {
        const type = reflect<string | null>()
        expectUnion(type, {kind: Types.TypeKind.Null}, { kind: Types.TypeKind.String});
    });

    it('string | undefined', () => {
        const type = reflect<string | undefined>()
        expectUnion(type, {kind: Types.TypeKind.Undefined}, {kind: Types.TypeKind.String});
    });

})



