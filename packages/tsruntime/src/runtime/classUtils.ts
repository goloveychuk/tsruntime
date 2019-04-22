import 'reflect-metadata';
import {ReflectedType} from './publicTypes'
export const REFLECTIVE_KEY = '__is_ts_runtime_reflective_decorator'


export function ReflectiveFactory<T>(fn: T) {
  return fn as T & { __is_ts_runtime_reflective_decorator: boolean }
}

export const Reflective = ReflectiveFactory(function (target: any) {

})



export const MetadataKey = "tsruntime:type"


export function getType(target: Function): ReflectedType | undefined {
  return Reflect.getMetadata(MetadataKey, target)
}

export function mustGetType(target: Function): ReflectedType {
  const type = getType(target)
  if (type === undefined) {
    throw new Error("can't find type")
  }
  return type
}



export function mustGetPropType(target: Function, propertyKey: string | symbol | number): ReflectedType {
  const type = getPropType(target, propertyKey)
  if (type === undefined) {
    throw new Error("can't find prop type")
  }
  return type
}



export function getPropType(target: Function, propertyKey: string | symbol | number): ReflectedType | undefined {
  return Reflect.getMetadata(MetadataKey, target.prototype, propertyKey as any)
}