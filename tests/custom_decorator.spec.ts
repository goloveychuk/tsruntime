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

@UserDecorator
export class MyClassA {
    a: string;
}

@OtherDecorator
export class MyClassB {
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

});

