import { createReflective } from "./common";
//@ts-ignore
import {MarkReflective} from './common'

export const reflect = createReflective(reflectedType => <T>()=> {
    return reflectedType
}) 
