# tsruntime

Library for emitting metadata for classes

## Installation
1) `npm i tsruntime`
2) configure awesome-typescript-loader:
```
const getCustomTransformers = require('tsruntime/dist/transformer').default;

{
  loader: 'awesome-typescript-loader',
  options: {
    getCustomTransformers
  }
}
```
## Usage:
1) decorate classes you want to reflect with proper decorator
```ts
import {Reflective} from 'tsruntime';

@Reflective
export class StatsModel {
    a?: number
    b: string
    c: Array<string>
    d: number | string | null
}  

@Reflective
class Foo extends Array<string> {
  
}

```

2) get runtime class info:
```ts
import {Types, getType} from 'tsruntime';

const clsType = getType(Foo)
console.log(clsType.props, clsType.extends);
const dType = getType(StatsModel, "d")
```
3) what info available - https://github.com/goloveychuk/tsruntime/blob/master/src/types.ts#L22

## Example emitted output
```js
var StatsModel = (function () {
    function StatsModel() {
    }
    return StatsModel;
}());
__decorate([
    Reflect.metadata("tsruntime:type", { kind: 7, types: [{ kind: 2 }, { kind: 5 }] })
], StatsModel.prototype, "a", void 0);
__decorate([
    Reflect.metadata("tsruntime:type", { kind: 1 })
], StatsModel.prototype, "b", void 0);
__decorate([
    Reflect.metadata("tsruntime:type", { kind: 6, type: Array, arguments: [{ kind: 1 }] })
], StatsModel.prototype, "c", void 0);
__decorate([
    Reflect.metadata("tsruntime:type", { kind: 7, types: [{ kind: 2 }, { kind: 1 }, { kind: 4 }] })
], StatsModel.prototype, "d", void 0);
StatsModel = __decorate([
    Reflect.metadata("tsruntime:type", { kind: 8, props: ["a", "b", "c", "d"] })
], StatsModel);

var Foo = (function (_super) {
    __extends(Foo, _super);
    function Foo() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Foo;
}(Array));
Foo = __decorate([
    Reflect.metadata("tsruntime:type", { kind: 8, props: [], extends: { kind: 6, type: Array, arguments: [{ kind: 1 }] } })
], Foo);
```
