/**
 * File with tests showing current limitations.
 *
 * note: tests may be need to be disabled until they work correctly.
 */
import {
   Reflective,
   mustGetType,
   mustGetPropType,
   getType,
   getPropType,
   Types
} from '../src/types'

import { ExternalClass } from './external_classes';

class OuterClass {

}

@Reflective
class TestClass {
   type_prop: typeof OuterClass = OuterClass;
}


@Reflective
class ParentClass {
   children: (OuterClass|TestClass)[] = [];
}

/**
 * BUG: Breaks the runtime load.
 *
 * Refers to a type ("ExternalClass") that is not used in this
 * file by the normal code so it is not exposed.
 */
/*
@Reflective
class UseExternalClass {
   extRef: ExternalClass;
}
*/


interface IGeom {
    coordinates: any;
}

/**
 * BUG: Breaks the runtime load.
 *  reason: tsruntime generates a object that assumes "IGeom" is a class type that can
 *          be referred to at runtime. Since it is not, the generated code can't
 *          execute and has a reference error.
 */
/*
@Reflective
class LocationClass {
   geomProp:  IGeom;
}
*/


describe('Missing Support', () => {
   it('should support "type of" types', () => {
      // should allow supporting type of types
      const type_prop_type = getPropType(TestClass, "type_prop") as Types.UnknownType;
      expect(type_prop_type.kind).toBe(Types.TypeKind.Reference);
   });

   it('should support class union arrays', () => {
      // Should allow reflection of the types that make up the array
      const children_type = getPropType(ParentClass, "children") as Types.ReferenceType;
      expect(children_type.kind).toBe(Types.TypeKind.Reference);
      expect(children_type.type).toEqual(Array);
      expect(children_type.arguments[0].kind).toBe(Types.TypeKind.Union);
   });

   it('should work nested', () => {
      @Reflective
      class InnerClass {
          a: string;
      }

      const clsType = getType(InnerClass);
      // SHOULD WORK
      //expect(clsType).toBeDefined();
   });

   /*
   it('Interface / types in properties', () => {
      const clsType = getType(LocationClass);
      expect(clsType).toBeDefined();
   });
   */

});
