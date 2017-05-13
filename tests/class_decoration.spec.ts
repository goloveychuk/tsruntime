import {
   Reflective,
   Types,
   getType,
   getPropType
} from '../src';

const TypeKind = Types.TypeKind;


@Reflective
class TestClass {
    propA: string | null = '';
}

describe('Class Decoration', () => {

   it('should decorate null properties', () => {
      const ptype = getPropType(TestClass, 'propA') as Types.UnionType;
      expect(ptype.kind).toEqual(TypeKind.Union)
      expect(ptype.types).toEqual([{kind: TypeKind.Null}, {kind: TypeKind.String}])
   });

});

