import {
   getType,
   mustGetType,
} from '../src';

import { ReflectiveFactory as ReflectiveFactory1 } from '../dist/types'; // todo don't work
import { ReflectiveFactory as ReflectiveFactory2 } from '../src';;



export function ParamDecorator(params: {
    strParam: string,
}) {
    /* tslint:enable:ext-variable-name */
    return ReflectiveFactory1(function innerDecorator(ctor: Function): void {
        // Graft on other metadata information
        (ctor as any).StrParam = params.strParam;
    })
}

export class MyClassUndecorated {

}


@ParamDecorator({
    strParam: 'string_value',
})
export class ParamClass {
    a: string;
}
