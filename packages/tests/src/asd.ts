import {Reflective, reflect, defineReflectMetadata, createReflective} from 'tsruntime'





const reflect3 = createReflective( reflectedType => <T>(arg: number)=>({reflectedType, arg}))
const a = reflect3<string>(2)