import {reflect, Reflective, getClassType} from 'tsruntime'





interface Address {
    city?: string
    street: string
}



@Reflective
class Cls {
    public str!: string
    protected num?: number
    private names!: Array<string>
    address!: Address
    status: 'requirer' | 'city' | 'accept' | 'reject' = 'accept';

    constructor(public foo: string, private bar: number) {
        console.log(foo, bar)
    }
}



const type = reflect<Cls>()
const classType = getClassType(Cls);

console.log(classType)
console.log(type)
