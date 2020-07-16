# tsruntime

[![Build Status](https://travis-ci.org/goloveychuk/tsruntime.svg?branch=master)](https://travis-ci.org/goloveychuk/tsruntime)
[![npm version](https://badge.fury.io/js/tsruntime.svg)](https://www.npmjs.com/package/tsruntime)

Typescript custom transformer for emitting types for using in runtime (reflection).

## Motivation
Sometimes you need types metadata in the runtime, e.g. to validate backend response or set `propTypes` from `interface Props{}` 

It's docs for v3. For v2 go [here](https://github.com/goloveychuk/tsruntime/blob/596c10ecc31618effc598854bdb12ecd08e6dcc2/README.md)

## Prerequisites
- `typescript: =>2.3.0`

## Setup
- install `tsruntime` and `ttypescript`
- change `tsconfig.json`:
```js
{
    "compilerOptions": {
        "experimentalDecorators": true, // if you'll use decorators
        "plugins": [
            { "transform": "tsruntime/dist/transform/transformer.js", "type": "program" },
        ],
    }
}
```
- run with `ttypescript` compiler:
  - `ts-node --compiler=ttypescript src/index.ts`
  - `ttsc` 
  - change `compiler` in `awesome-typescript-loader` config
  - etc
### See [Example](./packages/example)

### Warning: You cannot use `transpileOnly` compiling mode and `isolatedModules` (if you want reflect types from imported modules).

## Usage:
### Using `reflect` function

```ts
import {reflect} from 'tsruntime';

interface StatsModel {
    a?: number
    b: string
    c: Array<string>
    d: number | string | null
}

const type = reflect<StatsModel>()
console.log(type)

const type2 = reflect<string>()
```
On compiled code you'll have
```js
var type = tsruntime_1.reflect({
  kind: 15 /*Object*/,
  name: "StatsModel",
  properties: {
    a: {
      kind: 17 /*Union*/,
      types: [{ kind: 12 /*Undefined*/ }, { kind: 3 /*Number*/ }]
    },
    b: { kind: 2 /*String*/ },
    c: {
      kind: 18 /*Reference*/,
      type: Array,
      arguments: [{ kind: 2 /*String*/ }]
    },
    d: {
      kind: 17 /*Union*/,
      types: [
        { kind: 13 /*Null*/ },
        { kind: 2 /*String*/ },
        { kind: 3 /*Number*/ }
      ]
    }
  }
})();
```
### Using class decorators
```ts
import {Reflective, getClassType} from 'tsruntime';

@Reflective
export class StatsModel {
    a?: number
    b!: string
    c!: Array<string>
    d!: number | string | null
}

@Reflective
class Foo extends Array<string> {

}

console.log(getClassType(StatsModel))
console.log(getClassType(Foo))
```
On runtime you'll have
```js
// ...
StatsModel = __decorate(
    [
      tsruntime_1.Reflective({
        kind: 19 /*Class*/,
        name: "StatsModel",
        properties: {
          a: {
            kind: 17 /*Union*/,
            types: [{ kind: 12 /*Undefined*/ }, { kind: 3 /*Number*/ }]
          },
          b: { kind: 2 /*String*/ },
          c: {
            kind: 18 /*Reference*/,
            type: Array,
            arguments: [{ kind: 2 /*String*/ }]
          },
          d: {
            kind: 17 /*Union*/,
            types: [
              { kind: 13 /*Null*/ },
              { kind: 2 /*String*/ },
              { kind: 3 /*Number*/ }
            ]
          }
        }
      })
    ],
    StatsModel
  );
// ...
```

### Using types info
```ts
import {Types, reflect} from 'tsruntime';

const isString = reflect<string>().kind === Types.TypeKind.String
```

[Full runtime info available](./packages/tsruntime/src/runtime/publicTypes.ts)

## Customization
You can customize both `reflect` and `Reflective` to do whatever you want

```ts

import {createReflective, Types} from 'tsruntime';

const storage = {} as any

function MyReflective (key: string) {
    return createReflective(reflectedType => {
        return (target: any) => {
            storage[key] = reflectedType
        }
    })
}

// typeof MyReflective('realcls') is MarkReflective type.

@MyReflective('realcls')
class Cls {
    prop = 42
}
// in compiled code - @MyReflective('realcls')({kind: ...})

const clsType = storage['realcls']


const validateResp = createReflective(
  reflectedType => <T>(resp: unknown) => { //should have <T>
    if (reflectedType.kind === Types.TypeKind.String) {
        return typeof resp === 'string'
    }
  }
)

const isValid = validateResp<string>('asd') 
// in compiled code - validateResp({kind: ...})('asd')

```

### How it works
`createReflective` expects `reflectedType => T` to be passed as arg.

It returns `T` and marks it as reflectable (`type MarkReflective`).

Transformer see that symbol have type `MarkReflective` and calls it with `reflectedType`. 

For function it gets type from first generic argument (thats why you need `<T>`), for decorator - from class declaration, related to decorator.
