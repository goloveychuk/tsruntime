# tsruntime

Library for emitting metadata for classes

Installation
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
Usage:
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
