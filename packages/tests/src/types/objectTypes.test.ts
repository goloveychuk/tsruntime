import { reflect, Types } from "tsruntime";

// const reflect2 = reflect
const constKey = "some-key";

const uniqSymb = Symbol("some symb");


const stringType = {kind: Types.TypeKind.String, modifiers: Types.ModifierFlags.None}

type ObjectType = {
    key: string
    42: string
    // [uniqSymb]: string
}



describe("object types", () => {
  it("simple object type", () => {
    const type = reflect<ObjectType>()

    expect(type).toEqual({
        kind: Types.TypeKind.Object,
        properties: {
            'key': stringType,
            42: stringType,
            // [uniqSymb]: stringType
        }
    })
  })
});
