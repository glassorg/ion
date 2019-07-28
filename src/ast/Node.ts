import { isDerivedClass } from ".";

export default class Node {

    location: Location | null = null

    constructor(values) {
        if (values != null) {
            Object.assign(this, values)
        }
    }

    static is(instance) {
        if (instance == null) {
            return false
        }
        if (instance instanceof this) {
            return true
        }
        return isDerivedClass(this, instance.constructor)
    }

}