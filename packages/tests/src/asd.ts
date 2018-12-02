import {reflect} from 'tsruntime'

// const reflect2 = reflect


interface Car {
    s: string
}

const type = reflect<Car>()
// const type2 = reflect2<Car>()


console.log(type)