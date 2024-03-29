import { CoreTypes } from "../common/CoreType";
import { Literal } from "./Literal";

export class StringLiteral extends Literal<string> {

    get coreType() {
        return CoreTypes.String;
    }

    toString(user?: boolean) {
        return JSON.stringify(this.value);
    }

}