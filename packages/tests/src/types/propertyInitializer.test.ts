import {getClassType, Reflective, Types} from "tsruntime";
import {expectUnion, initializerIsEqual} from "../utils";

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

describe("class properties initializers", () => {
  it("primitive types", () => {
    typeIsEqual(getPropType("string"), { kind: TypeKind.String, modifiers: Types.ModifierFlags.None });
    initializerIsEqual(getPropType("string"), 'string');
    typeIsEqual(getPropType("number"), { kind: TypeKind.Number, modifiers: Types.ModifierFlags.None  });
    initializerIsEqual(getPropType("number"), 42);
    typeIsEqual(getPropType("true"), { kind: TypeKind.Boolean, modifiers: Types.ModifierFlags.None  });
    initializerIsEqual(getPropType("true"), true);
    typeIsEqual(getPropType("false"), { kind: TypeKind.Boolean, modifiers: Types.ModifierFlags.None  });
    initializerIsEqual(getPropType("false"), false);
    typeIsEqual(getPropType("null"), { kind: TypeKind.Null, modifiers: Types.ModifierFlags.None  });
    initializerIsEqual(getPropType("null"), null);
    typeIsEqual(getPropType("undefined"), { kind: TypeKind.Undefined, modifiers: Types.ModifierFlags.None  });
    initializerIsEqual(getPropType("undefined"), undefined);
  });
  it("arrays", () => {
    for (const type of [getPropType("array"), getPropType("refArray")] as Array<
      Types.ReferenceType
    >) {
      typeIsEqual(type, {
        kind: TypeKind.Reference,
        type: Array,
        modifiers: Types.ModifierFlags.None,
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
        modifiers: Types.ModifierFlags.None,
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
        modifiers: Types.ModifierFlags.None,
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
