import { CoreType } from "../common/types";
import { Literal } from "./Literal";

export class StringLiteral extends Literal<string> {

    get coreType() {
        return CoreType.String;
    }

}