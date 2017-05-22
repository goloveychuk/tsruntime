import {
    getType,
    mustGetType,
} from '../src';

import { ReflectiveFactory as ReflectiveFactory1 } from '../dist/types'; // todo don't work
import { ReflectiveFactory as ReflectiveFactory2 } from '../src';;

const UserDecorator1 = ReflectiveFactory1(function (target: any) { })
const UserDecorator2 = ReflectiveFactory2(function (target: any) { })

function OtherDecorator(target: any) { }

@UserDecorator1
export class MyClass1 {
    a: string;
}

export function ParamDecorator(params: {
    strParam: string,
}) {
    /* tslint:enable:ext-variable-name */
    return ReflectiveFactory2(function innerDecorator(ctor: Function): void { //todo dont work with factory1
        // Graft on other metadata information
        (ctor as any).StrParam = params.strParam;
    })
}

export class MyClassUndecorated {

}


@OtherDecorator
export class MyClass2 {
    a: string;
}

@ParamDecorator({
    strParam: 'string_value',
})
export class ParamClass {
    a: string;
}

describe('Custom Decorators', () => {
    // Note UserDecorator is configured in webpack.test.js
    it('should allow UserDecorator imported from dist', () => {
        const clsType = getType(MyClass1);
        expect(clsType).not.toBeNull();
    });

    it('should allow UserDecorator imported from src', () => {
        const clsType = getType(MyClass2);
        expect(clsType).not.toBeNull();
    });

    it('should throw on non-decorated', () => {
        expect(() => {
            mustGetType(MyClassUndecorated);
        }).toThrow();
    });

    it('should allow decorators with params', () => {
        const clsType = mustGetType(ParamClass);
        expect((ParamClass as any).StrParam).toEqual('string_value');
    });

});

