import {
    getType,
    mustGetType,
} from '../src';
import {
    Reflective
} from '../src';

import { ExportedCls as Ecls } from './module' //todo aliasing


@Reflective
class Asd3  {
    ad: boolean | null
    ad2: false | true
    ad3: false | true | boolean
    ad4: false | true | boolean | number
    ad5: false
    ad6: true
    ad7: false | number
    ad8?: boolean
}


