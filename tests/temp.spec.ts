import {
    getType,
    mustGetType,
} from '../src';
import {
   Reflective
} from '../src';

import {ExportedCls} from './module'

class Asd2 extends ExportedCls {
    asd: 'sadf'
}
@Reflective
class Asd3<T> extends Asd2 {
    fasd: string
}
@Reflective
class Asd {
    ref: Asd3<string>
}
