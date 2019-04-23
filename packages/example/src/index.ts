import {reflect, Reflective, getClassType} from 'tsruntime'








@Reflective
class Cls {
    str!: string
}



const type = reflect<string>()

console.log(getClassType(Cls))
console.log(type)