import { isValidId } from "../common/names";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";

export class Reference extends Expression {

    constructor(
        location: SourceLocation,
        public readonly name: string,
    ){
        super(location);
    }

    get isReference() {
        return true;
    }

    toString() {
        return isValidId(this.name) ? this.name : ("`" + this.name + "`");
    }

}