import { CoreType } from "../common/types";
import { Literal } from "./Literal";

export class FloatLiteral extends Literal<number> {

    get coreType() {
        return CoreType.Float
    }

    toString() {
        return Number.isInteger(this.value) ? this.value.toFixed(1) : this.value.toString();
    }
}