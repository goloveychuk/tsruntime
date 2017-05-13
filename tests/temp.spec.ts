import {
   getType,
   mustGetType,
} from '../src';

import {ReflectiveFactory as ReflectiveFactory1 } from '../';
import {ReflectiveFactory as ReflectiveFactory2} from '../src';;

const UserDecorator1 = ReflectiveFactory2(function (target: any) { })
const UserDecorator2 = ReflectiveFactory2(function (target: any) { })

function OtherDecorator(target: any) { }

@UserDecorator1
export class MyClass1 {
    a: string;
}

@UserDecorator2
export class MyClass2 {
    a: string;
}

@OtherDecorator
export class MyClassB {
    a: string;
}