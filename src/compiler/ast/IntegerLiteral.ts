import { CoreTypes } from "../common/CoreType";
import { NumberLiteral } from "./NumberLiteral";

export class IntegerLiteral extends NumberLiteral<bigint> {

    get coreType() {
        return CoreTypes.Integer;
    }

}