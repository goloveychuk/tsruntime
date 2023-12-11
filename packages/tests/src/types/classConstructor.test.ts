import {getClassType, Reflective, Types} from "tsruntime";
import {initializerIsEqual} from "../utils";

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
            modifiers: [Types.ModifierFlags.None],
            type: {kind: Types.TypeKind.String},
          },
          {
            name: "bar",
            modifiers: [Types.ModifierFlags.None],
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

    expect(type.constructors).toMatchObject([
      {
        parameters: [
          {
            name: "foo",
            modifiers: [Types.ModifierFlags.Public],
          },
          {
            name: "bar",
            modifiers: [Types.ModifierFlags.Private],
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

    expect(type.constructors).toMatchObject([
      {
        parameters: [
          {
            name: "foo",
            type: {kind: Types.TypeKind.String},
          },
        ],
      },
      {
        parameters: [
          {
            name: "bar",
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

    expect(type.constructors).toMatchObject([
      {
        modifiers: Types.ModifierFlags.Private,
      },
    ]);
  });

  it("works with recursive parameters", () => {
    @Reflective
    class RecursiveClass {
      constructor(child: RecursiveClass) {
        console.log(child);
      }
    }
    const type = getClassType(RecursiveClass);

    expect(type.constructors).toMatchObject([
      {
        parameters: [
          {
            name: "child",
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
      constructor(foo: string = 'str', bar: number = 123) {
        console.log(foo, bar);
      }
    }
    const type = getClassType(ClassWithOptionalParameters);
    const params = type.constructors[0].parameters;

    initializerIsEqual(params[0].type, 'str');
    initializerIsEqual(params[1].type, 123);
  });

  it("supports spread parameters", () => {
    @Reflective
    class ClassWithSpreadParameter {
      constructor(...rest: any[]) {
        console.log(rest);
      }
    }
    const type = getClassType(ClassWithSpreadParameter);

    expect(type.constructors).toMatchObject([
      {
        parameters: [
          {
            name: "rest",
            type: {
              kind: Types.TypeKind.Reference,
              type: Array,
              arguments: [{ kind: Types.TypeKind.Any }],
            },
          },
        ],
      },
    ]);
  })
});
