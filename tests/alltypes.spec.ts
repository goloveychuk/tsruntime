
import {Reflective, getType, getPropType, Types} from '../src/types'

class GenericCls<T> {

}

class Cls {

}

enum Enum {
    a = 1,
    b
}

@Reflective
class AllTypes {
    string: string
    number: number
    any: any
    undefined: undefined
    null: null
    void: void
    never: never
    union: string | number
    symbol: symbol
    array: string[]
    // object: {}
    tuple: [string, number]

    enum: Enum

    refArray: Array<string>
    refString: String
    refNumber: Number
    refDate: Date

    ref: Cls
    genRef: GenericCls<string>

    optional?: String
}

@Reflective
class DerrivedTypes {
    string = "string"
    number = 42
    array = []
    boolean = false
    boolean2 = true
    null = null
    undefined = undefined

    refArray = Array<string>()
    ref = new Cls()
    genRef = new GenericCls<string>()
}



// a.a = null








describe('All types', () => {
   it('number', () => {
      const clsType = getPropType(AllTypes, "string") as Types.StringType;
      expect(clsType.kind).toBe(Types.TypeKind.String)
   });
});

