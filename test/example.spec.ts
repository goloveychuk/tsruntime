import {
   Reflective,
   Types,
   getType,
} from '../src';

const TypeKind = Types.TypeKind;

/**
 * Example from README.md file.
 */

@Reflective
export class StatsModel {
    a?: number
    b: string
    c: Array<string>
    d: number | string | null
}

@Reflective
class Foo extends Array<string> {

}

describe('Example works', () => {
   it('should have class types', () => {
      const clsType = getType(Foo) as Types.ClassType;
      const baseType = clsType.extends;
      expect(clsType).not.toBeNull();

      expect(clsType.props).toEqual([]);
      expect(baseType!.kind).toEqual(TypeKind.Reference);
   });

   it('should have property type details', () => {
      const stats_type = getType(StatsModel) as Types.ClassType;
      expect(stats_type.props).toEqual(['a', 'b', 'c', 'd']);

      const dType = getType(StatsModel.prototype, "d")
      expect(dType).not.toBeNull();
      expect(dType.kind).toEqual(TypeKind.Union);
   });

});

