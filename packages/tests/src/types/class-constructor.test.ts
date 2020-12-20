import {getClassType, Reflective, Types} from "tsruntime";

describe("Class Constructor", () => {
  it("contains parameters", () => {
    @Reflective
    class ClassWithSimpleConstructor {
      constructor(foo: string, bar: number) {
        console.log(foo, bar);
      }
    }
    const type = getClassType(ClassWithSimpleConstructor);

    expect(type.constructors).toEqual([
      {
        modifiers: 0,
        parameters: [
          {
            name: "foo",
            modifiers: 0,
            type: {kind: Types.TypeKind.String},
          },
          {
            name: "bar",
            modifiers: 0,
            type: {kind: Types.TypeKind.Number},
          },
        ],
      },
    ]);
  });

  it("contains parameter modifiers", () => {
    @Reflective
    class ClassWithPropertyConstructor {
      constructor(public foo: string, private bar: number) {
        console.log(foo, bar);
      }
    }
    const type = getClassType(ClassWithPropertyConstructor);

    expect(type.constructors).toEqual([
      {
        modifiers: 0,
        parameters: [
          {
            name: "foo",
            modifiers: Types.ModifierFlags.Public,
            type: {kind: Types.TypeKind.String},
          },
          {
            name: "bar",
            modifiers: Types.ModifierFlags.Private,
            type: {kind: Types.TypeKind.Number},
          },
        ],
      },
    ]);
  });

  it("works with multiple constructors", () => {
    @Reflective
    class ClassWithMultipleConstructors {
      constructor(foo: string);
      constructor(bar: number);
      constructor() {}
    }
    const type = getClassType(ClassWithMultipleConstructors);

    expect(type.constructors).toEqual([
      {
        modifiers: 0,
        parameters: [
          {
            name: "foo",
            modifiers: 0,
            type: {kind: Types.TypeKind.String},
          },
        ],
      },
      {
        modifiers: 0,
        parameters: [
          {
            name: "bar",
            modifiers: 0,
            type: {kind: Types.TypeKind.Number},
          },
        ],
      },
    ]);
  });

  it("contains constructor modifiers", () => {
    @Reflective
    class ClassWithPrivateConstructor {
      // noinspection JSUnusedLocalSymbols
      private constructor() {}
    }
    const type = getClassType(ClassWithPrivateConstructor);

    expect(type.constructors).toEqual([
      {
        modifiers: Types.ModifierFlags.Private,
        parameters: [],
      },
    ]);
  });

  it("works with recursive parameters", () => {
    @Reflective
    class RecursiveClass {
      constructor(public child: RecursiveClass) {}
    }
    const type = getClassType(RecursiveClass);

    expect(type.constructors).toEqual([
      {
        modifiers: 0,
        parameters: [
          {
            name: "child",
            modifiers: Types.ModifierFlags.Public,
            type: {
              kind: Types.TypeKind.Reference,
              arguments: [],
              type: RecursiveClass,
            },
          },
        ],
      },
    ]);
  });

  it("supports initializer in parameters", () => {
    @Reflective
    class ClassWithOptionalParameters {
      constructor(foo: string = 'str') {
        console.log(foo);
      }
    }
    const type = getClassType(ClassWithOptionalParameters);
    const initializer = type.constructors[0].parameters[0].type.initializer;
    expect(initializer && initializer()).toEqual('str');
  });
});
