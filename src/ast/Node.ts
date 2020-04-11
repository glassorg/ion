import Location from "./Location";
import { isDerivedClass } from "./runtime";

export default class Node {

    location!: Location

    constructor(...values) {
        Object.assign(this, ...values)
    }

    static is(instance, debug?) {
        return is(instance, this)
    }

}

export function is(instance, cls) {
    if (instance == null) {
        return false
    }
    if (instance instanceof cls) {
        return true
    }
    return isDerivedClass(cls, instance.constructor)
}
