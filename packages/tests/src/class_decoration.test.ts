import {
   Reflective,
   Types,
   getType,
   getPropType
} from 'tsruntime';



@Reflective
class TestClass extends Array<string> {
    'str': string
    'str-str': string
    42: string
    get computed() {
        return 'string'
    }
    [Symbol.toPrimitive](){
        return 23
    }
    method() {
        return 'asd'
    }
}

describe('Class Decoration', () => {

   it('should decorate null properties', () => {
      const ptype = getType(TestClass) as Types.ClassType
      expect(ptype.kind).toEqual(Types.TypeKind.Class)
      expect(ptype.name).toEqual('TestClass')
      expect(ptype.extends).toEqual({kind: Types.TypeKind.Reference, type: Array, arguments: [{kind: Types.TypeKind.String} as any]})
      
      expect(ptype.props).toEqual(['str', 'str-str', 42])

      expect(getPropType(TestClass, 42)).toEqual({kind: Types.TypeKind.String})
      
   });

});

