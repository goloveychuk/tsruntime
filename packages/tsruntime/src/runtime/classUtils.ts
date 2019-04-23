import 'reflect-metadata';
import {ClassType, ReflectedType} from './publicTypes'
export const REFLECTIVE_KEY = '__is_ts_runtime_reflective_decorator'




export type ReflectiveDecorator =  ((target: any) => void) & {
  __is_ts_runtime_reflective_decorator: boolean
}

type UnprocessedDecorator = (type: ReflectedType) => (target: any) => void


export function createReflectiveDecorator(fn: UnprocessedDecorator) {
  return fn as any as ReflectiveDecorator
}

export const MetadataKey = "tsruntime:type"

export function defineReflectMetadata(target: any, reflectedType: ReflectedType) {
  Reflect.defineMetadata(MetadataKey, reflectedType, target)
}

export const Reflective = createReflectiveDecorator(reflectedType => (target: any) => {
  defineReflectMetadata(target, reflectedType)
})





export function getClassType(target: Function): ClassType {
  return Reflect.getMetadata(MetadataKey, target)
}
