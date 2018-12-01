declare function reflect<T>(): Object 

interface Props {

}

const t = reflect<Props>()

function setProps(comp: any, type: Object) {

}

function setProps2<T>(comp: T) {
    const t = reflect<InferProps<T>>()

}

type InferProps<T> = T


function Comp(props: Props) {

}

setProps(Comp, reflect<InferProps<typeof Comp>>())


function createReflect() {

}

const reflect2 = createReflect(setProps)


reflect2(Comp)


const reflect3 = createReflect(setProps)


@reflect3()
class Cls {

}