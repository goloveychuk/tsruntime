import {
    getType,
    mustGetType,
} from '../src';
import {
    Reflective
} from '../src';

import { ExportedCls as ECls } from './module' //todo aliasing

enum Asd {
    a= 1,
    b,
    c
}
// let a  = asd

@Reflective
class Asd3  {
    ad = new ECls()
    a: Asd
}


