import {
   getType,
   mustGetType
} from '../src';


function UserDecorator(target: any) {
    // Verifies that tsruntime decorations are
    // available before user decorator is applied.
    const clsType = mustGetType(target);
}

function OtherDecorator(target: any) { }

export function ParamDecorator(params: {
                           strParam: string,
                        }): Function {
/* tslint:enable:ext-variable-name */
   return function innerDecorator(ctor: Function): void {
      // Graft on other metadata information
      (ctor as any).StrParam = params.strParam;
   };
}

@UserDecorator
export class MyClassA {
    a: string;
}

@OtherDecorator
export class MyClassB {
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
   it('should allow UserDecorator', () => {
      const clsType = getType(MyClassA);
      expect(clsType).not.toBeNull();
   });

   it('should throw on non-decorated', () => {
      expect(() => {
          mustGetType(MyClassB);
      }).toThrow();
   });

   it('should allow decorators with params', () => {
      const clsType = mustGetType(ParamClass);
      expect((ParamClass as any).StrParam).toEqual('string_value');
   });

});

