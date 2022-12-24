import { Literal } from "./Literal";
import { CoreType } from "../common/types";

export class IntegerLiteral extends Literal<number> {

    get coreType() {
        return CoreType.Integer;
    }

}