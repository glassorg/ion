import { CoreTypes } from "../common/CoreType";
import { NumberLiteral } from "./NumberLiteral";
import { SourceLocation } from "./SourceLocation";

export class IntegerLiteral extends NumberLiteral<bigint> {

    constructor(location: SourceLocation, value: bigint | number | string) {
        super(location, BigInt(value));
    }

    get coreType() {
        return CoreTypes.Integer;
    }

    toJSON() {
        const base = super.toJSON();
        return { ...base, value: this.value.toString() }
    }

    toString() {
        return this.value.toString();
    }

}