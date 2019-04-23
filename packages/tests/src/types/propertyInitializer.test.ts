import { Reflective, Types, getClassType } from "tsruntime";
import { expectUnion } from "../utils";

const { TypeKind } = Types;
class GenericCls<T> {}

class Cls {imCls=true}

enum SomeEnum {
  a,
  b
}

@Reflective
class DerrivedTypes {
  string = "string";
  number = 42;
  true = true;
  false = false;
  null = null;
  undefined = undefined;

  array = ["string"];
  refArray = Array.from(["string"]);
  ref = new Cls();
  genRef = new GenericCls<string>();

  enum = SomeEnum.a;
}

function getPropType(name: keyof DerrivedTypes) {
  const type = getClassType(DerrivedTypes);
  return type.properties[name];
}

function typeIsEqual(type: Types.ReflectedType, val: any) {
  const { initializer, ...otherType } = type;
  expect(otherType).toEqual(val);
}
function initializerIsEqual(type: Types.ReflectedType, val: any) {
  expect(type.initializer).not.toBe(undefined);
  expect(type.initializer!()).toEqual(val);
}

describe("class properties initializers", () => {
  it("primitive types", () => {
    typeIsEqual(getPropType("string"), { kind: TypeKind.String });
    initializerIsEqual(getPropType("string"), 'string');
    typeIsEqual(getPropType("number"), { kind: TypeKind.Number });
    initializerIsEqual(getPropType("number"), 42);
    typeIsEqual(getPropType("true"), { kind: TypeKind.Boolean });
    initializerIsEqual(getPropType("true"), true);
    typeIsEqual(getPropType("false"), { kind: TypeKind.Boolean });
    initializerIsEqual(getPropType("false"), false);
    typeIsEqual(getPropType("null"), { kind: TypeKind.Null });
    initializerIsEqual(getPropType("null"), null);
    typeIsEqual(getPropType("undefined"), { kind: TypeKind.Undefined });
    initializerIsEqual(getPropType("undefined"), undefined);
  });
  it("arrays", () => {
    for (const type of [getPropType("array"), getPropType("refArray")] as Array<
      Types.ReferenceType
    >) {
      typeIsEqual(type, {
        kind: TypeKind.Reference,
        type: Array,
        arguments: [{ kind: TypeKind.String }]
      });
      initializerIsEqual(type, ["string"]);
    }
  });

  it("ref", () => {
    const type = getPropType("ref") as Types.ReferenceType;
    typeIsEqual(type, {
        kind: TypeKind.Reference,
        type: Cls,
        arguments: []
      });
      expect(type.initializer).not.toBeUndefined()
    expect(type.initializer!().imCls).toBe(true);

  });
  it("gen ref", () => {
    const type = getPropType("genRef") as Types.ReferenceType;
    typeIsEqual(type, {
        kind: TypeKind.Reference,
        type: GenericCls,
        arguments: [{ kind: Types.TypeKind.String }]
      });
      expect(type.initializer).not.toBeUndefined()
  });

  it("enum", () => {
    const type = getPropType("enum") as Types.UnionType;
    expectUnion(
      type,
      { kind: Types.TypeKind.NumberLiteral, value: 0 },
      { kind: Types.TypeKind.NumberLiteral, value: 1 }
    );
  });
});
