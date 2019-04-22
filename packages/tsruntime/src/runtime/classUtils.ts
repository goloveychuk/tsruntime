import 'reflect-metadata';
import {ReflectedType} from './publicTypes'
export const REFLECTIVE_KEY = '__is_ts_runtime_reflective_decorator'


export function ReflectiveFactory<T>(fn: T) {
  return fn as T & { __is_ts_runtime_reflective_decorator: boolean }
}

export const Reflective = ReflectiveFactory(function (target: any) {

})



export const MetadataKey = "tsruntime:type"


export function getType(target: Function): ReflectedType {
  return Reflect.getMetadata(MetadataKey, target)
}
