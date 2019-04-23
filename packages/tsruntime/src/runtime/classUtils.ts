import 'reflect-metadata';
import {ClassType, ReflectedType} from './publicTypes'
import { createReflective } from './common';

//@ts-ignore
import {MarkReflective} from './common'



// type Decorator = (target: any) => void



const MetadataKey = Symbol("tsruntime:type")

export function defineReflectMetadata(target: any, reflectedType: ReflectedType) {
  Reflect.defineMetadata(MetadataKey, reflectedType, target)
}

export const Reflective = createReflective(reflectedType => (target: any) => {
  defineReflectMetadata(target, reflectedType)
})





export function getClassType(target: Function): ClassType {
  return Reflect.getMetadata(MetadataKey, target)
}
