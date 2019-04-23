import {
  createReflectiveDecorator,
  Types,
  getClassType,
  defineReflectMetadata
} from "tsruntime";

const Reflective2 = (res: string) =>
  createReflectiveDecorator(reflectedType => target => {
    target.lol = res
    defineReflectMetadata(target, reflectedType);
  });

@Reflective2("s")
class TestClass {
  prop!: string;
  static lol = ''
}

describe("custom reflective", () => {
  it("works", () => {
    const type = getClassType(TestClass);
    expect(TestClass.lol).toBe('s')
    expect(type).toEqual({
      name: "TestClass",
      kind: Types.TypeKind.Class,
      properties: {
        prop: { kind: Types.TypeKind.String }
      }
    });
  });
});
