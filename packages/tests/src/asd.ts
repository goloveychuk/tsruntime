import {Reflective, reflect, defineReflectMetadata} from 'tsruntime'





const a = reflect<string>()


// @Reflective
// class B {
//     d!: string
// }

const type = (()=>reflect<string>())()
