import {Reflective, reflect, createReflectiveDecorator, defineReflectMetadata} from 'tsruntime'

const Reflective2 = (re: string)=> {
    return createReflectiveDecorator(reflectedType => target => {
        defineReflectMetadata(target, reflectedType)
    })
}



@Reflective2('s')
class TestClass  extends Array {
    myprop = 'asd'
}

