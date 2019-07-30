import { isDerivedClass } from "./runtime";

export default class Node {

    location!: Location

    constructor(...values) {
        Object.assign(this, ...values)
    }

    static is(instance) {
        if (instance == null) {
            return false
        }
        if (instance instanceof (this as any)) {
            return true
        }
        return isDerivedClass(this, instance.constructor)
    }

}