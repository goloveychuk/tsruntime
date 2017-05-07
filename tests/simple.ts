import {Mod} from './mod'
import {Reflective} from '../src/types'

class GenericCls<T> {

}

@Reflective
class AllTypes {
    // string: string
    // number: number
    // any: any
    // undefined: undefined
    // null: null
    // void: void
    // never: never
    // union: string | number
    // symbol: symbol
    // array: string[]
    // object: {}
    tuple: [string, number]

    refArray: Array<string>
    refString: String
    refNumber: Number
    refDate: Date

    ref: Mod
    genRef: GenericCls<string>

}



// a.a = null