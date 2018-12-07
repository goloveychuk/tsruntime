import { reflect, Types } from "tsruntime";

// const reflect2 = reflect
const constKey = "some-key";

const uniqSymb = Symbol("some symb");


const stringType = {kind: Types.TypeKind.String}

type ObjectType = {
    key: string
    42: string
    [uniqSymb]: string
}



type symbTypeAlias = typeof uniqSymb


type StrOrNull<T> = {[K in keyof T]: string | null}


describe("object types", () => {
  it("simple object type", () => {
    const type = reflect<ObjectType>()

    expect(type).toEqual({
        kind: Types.TypeKind.Object,
        properties: {
            'key': stringType,
            42: stringType,
            [uniqSymb]: stringType
        }
    })
  })
  it('mapped - record', () => {
      const type = reflect<Record<symbTypeAlias | 'key' | 42, string>>()
      expect(type).toEqual({
        kind: Types.TypeKind.Object,
        properties: {
            'key': stringType,
            42: stringType,
            [uniqSymb]: stringType
        }
    })
  })
});
