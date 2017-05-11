import {
   getType,
} from '../src';


function UserDecorator(target: any) { }

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
          getType(MyClassB);
      }).toThrow();
   });

});

