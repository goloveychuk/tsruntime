import {
    getType,
    mustGetType,
} from '../src';
import {
   Reflective
} from '../src';

import {ExportedCls} from './module'


@Reflective
class Asd {
    ref: ExportedCls
}
