



import {Reflective} from 'tsruntime'

import {ExportedCls} from './module';


type StringAlias = string

type StringStringAlias = StringAlias


class Cls<T> {

}

type ClsAlias = Cls<string>

interface Interface {

}

interface ValuedInterface {

}
const ValuedInterface = String

interface GenValuedInterface<T> {

}
const GenValuedInterface = String


interface GenInterface<T> {

}

@Reflective
class Imported {
    str!: StringAlias
    strstr!: StringStringAlias
    ref!: Cls<string>
    refAlias!: ClsAlias
    expRef!: ExportedCls
    arrRef!: Array<string>
    arr!: string[]
    stringRef!: String
    inter!: Interface
    valuedInterface!: ValuedInterface
    genValuedInterface!: GenValuedInterface<string>
    genInterface!: GenInterface<string>
}

