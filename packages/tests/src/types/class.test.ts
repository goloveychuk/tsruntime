import { Reflective, Types, getClassType } from "tsruntime";
import { TestClass3 } from "./module2";
import { ExportedClass } from "./module";

@Reflective
class TestClass extends Array<string> {
  "str": string;
  "str-str": string;
  42: string;
  get computed() {
    return "string";
  }
  [Symbol.toPrimitive]() {
    return 23;
  }
  method() {
    return "asd";
  }
}



@Reflective
class TestClass2 extends TestClass {
  newProp!: string;
}



class ShouldntBeReflected {
  prop!: string
}

describe("Class Decoration", () => {
  it("should decorate cls", () => {
    const type = getClassType(TestClass)

    expect(type).toEqual({
      name: "TestClass",
      kind: Types.TypeKind.Class,
      extends: {
        kind: Types.TypeKind.Reference,
        type: Array,
        arguments: [{ kind: Types.TypeKind.String }]
      },
      properties: {
        str: { kind: Types.TypeKind.String },
        "str-str": { kind: Types.TypeKind.String },
        42: { kind: Types.TypeKind.String }
      }
    });
  });

  it("should decorate cls", () => {
    const type = getClassType(TestClass2)

    expect(type).toEqual({
      name: "TestClass2",
      kind: Types.TypeKind.Class,
      extends: {
        kind: Types.TypeKind.Reference,
        type: TestClass,
        arguments: []
      },
      properties: {
        newProp: { kind: Types.TypeKind.String },
      }
    });
  });
  it('shouldnt clean not used references', () => {
    expect(getClassType(TestClass3)).toEqual({
      name: "TestClass3",
      kind: Types.TypeKind.Class,
      properties: {
        exported: { kind: Types.TypeKind.Reference, type: ExportedClass, arguments: [] },
      }
    })
  })
  it("shoulldnt reflect all classes", () => {
    expect(getClassType(ShouldntBeReflected)).toBeUndefined()
  })
});
