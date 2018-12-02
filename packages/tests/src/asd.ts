import {reflect} from 'tsruntime'

// const reflect2 = reflect
const constKey = 'some-key'

const uniqSymb = Symbol('some symb')

type ObjectType = {
    key: string
    42: number
    [uniqSymb]: string
}

interface Inter {
    [uniqSymb]: 'sdf'
//   s: string;
}
type aliased = typeof uniqSymb

type Rec = Record<aliased | 'someasd' | 42, string>

type StrOrNull<T> = {[K in keyof T]: string | null}

const type = reflect<Inter>()
const type2 = reflect<Rec>()
const type3 = reflect<StrOrNull<ObjectType>>()



console.log(type)