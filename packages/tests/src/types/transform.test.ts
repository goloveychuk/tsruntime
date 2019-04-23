import { TestClass3 } from "./module2";
import { ExportedClass } from "./module";
import {
  getClassType,
  Types,
  reflect,
  createReflective,
  defineReflectMetadata
} from "tsruntime";

class ShouldntBeReflected {
  prop!: string;
}

const reflect2 = createReflective(
  type1 => <T>(cb: () => Types.ReflectedType) => {
    return { type1, type2: cb() };
  }
);

const Reflective2 = (res: string) =>
  createReflective(reflectedType => (target: any) => {
    target.lol = res;
    defineReflectMetadata(target, reflectedType);
  });

@Reflective2("s")
class TestClass {
  prop!: string;
  static lol = "";
}

describe("transform", () => {
  it("shouldnt clean not used references", () => {
    expect(getClassType(TestClass3)).toEqual({
      name: "TestClass3",
      kind: Types.TypeKind.Class,
      properties: {
        exported: {
          kind: Types.TypeKind.Reference,
          type: ExportedClass,
          arguments: []
        }
      }
    });
  });
  it("shoulldnt reflect all classes", () => {
    expect(getClassType(ShouldntBeReflected)).toBeUndefined();
  });
  it("should find reflect in call expression", () => {
    const type = (() => reflect<string>())();
    expect(type).toEqual({ kind: Types.TypeKind.String });
  });

  it("should find reflect in reflective call expression, custom reflect fn", () => {
    const type = (() =>
      reflect2<string>(() => {
        return (() => reflect<number>())();
      }))();
    expect(type).toEqual({
      type1: { kind: Types.TypeKind.String },
      type2: { kind: Types.TypeKind.Number }
    });
  });
  it("custom reflective", () => {
    const type = getClassType(TestClass);
    expect(TestClass.lol).toBe("s");
    expect(type).toEqual({
      name: "TestClass",
      kind: Types.TypeKind.Class,
      properties: {
        prop: { kind: Types.TypeKind.String }
      }
    });
  });
});
