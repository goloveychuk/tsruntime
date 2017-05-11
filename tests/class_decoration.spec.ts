import {
   Reflective,
   Types,
   getType
} from '../src';

const TypeKind = Types.TypeKind;


@Reflective
class TestClass {
    propA: string | null = '';
}

describe('Class Decoration', () => {

   it('should decorate null properties', () => {
      const ptype = getType(TestClass.prototype, 'propA') as Types.UnionType;

      expect(ptype.kind).toEqual(TypeKind.Union)
      expect(ptype.types[0].kind).toEqual(TypeKind.String);
      expect(ptype.types[1].kind).toEqual(TypeKind.Null);
   });

});

