import { Literal } from "./Literal";

export class FloatLiteral extends Literal<number> {

    toString() {
        return Number.isInteger(this.value) ? this.value.toFixed(1) : this.value.toString();
    }
}