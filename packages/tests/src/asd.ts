import {reflect} from 'tsruntime'

// const reflect2 = reflect
const constKey = 'some-key'

const uniqSymb = Symbol('some symb')



type symbTypeAlias = typeof uniqSymb


const type = reflect<Record<symbTypeAlias | 'key' | 42, string>>()

