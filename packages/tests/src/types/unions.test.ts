
import { Reflective, getType, getPropType, Types } from 'tsruntime'






@Reflective
class UnionTypes {
    string_null: string | null = '';
    string_undefined: string | undefined;
}










describe('union types', () => {
    it('string | null', () => {
        const type = getPropType(UnionTypes, "string_null") as Types.UnionType;
        expect(type.types[1].kind).toBe(Types.TypeKind.String);
        expect(type.types[0].kind).toBe(Types.TypeKind.Null);
    });

    it('string | undefined', () => {
        const type = getPropType(UnionTypes, "string_undefined") as Types.UnionType;
        expect(type.types[1].kind).toBe(Types.TypeKind.String);
        expect(type.types[0].kind).toBe(Types.TypeKind.Undefined);
    });

})



