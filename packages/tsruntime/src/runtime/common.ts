import { ReflectedType } from "./publicTypes";

export const REFLECTIVE_KEY: '__is_ts_runtime_reflective_decorator' = '__is_ts_runtime_reflective_decorator'


export type MarkReflective<T> =  T & {
    [REFLECTIVE_KEY]: boolean
  }
  
  export function createReflective<T>(fn: (type: ReflectedType) =>T) {
    return fn as any as MarkReflective<T> 
  }