import {Mod} from './mod'
import {Reflective} from '../src/types'

class GenericCls<T> {

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

    ref: Mod
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
    ref = new Mod()
    genRef = new GenericCls<string>()
}



// a.a = null