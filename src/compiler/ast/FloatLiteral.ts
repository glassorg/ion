import { CoreTypes } from "../common/CoreType";
import { NumberLiteral } from "./NumberLiteral";

export class FloatLiteral extends NumberLiteral<number> {

    get coreType() {
        return CoreTypes.Float
    }

    toJSON() {
        if (isNaN(this.value)) {
            return "NaN";
        }
        if (this.value === Number.POSITIVE_INFINITY) {
            return "+Infinity";
        }
        if (this.value === Number.NEGATIVE_INFINITY) {
            return "-Infinity";
        }
        return this.toString();
    }

    toString() {
        return Number.isInteger(this.value) ? this.value.toFixed(1) : this.value.toString();
    }
}