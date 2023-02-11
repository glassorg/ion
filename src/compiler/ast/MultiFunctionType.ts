import { Expression } from "./Expression";
import { FunctionType } from "./FunctionType";
import { SourceLocation } from "./SourceLocation";

export class MultiFunctionType extends Expression {

    constructor(
        location: SourceLocation,
        public readonly functionTypes: FunctionType[],
    ) {
        super(location);
    }

    toString() {
        return this.toBlockString(this.functionTypes);
    }
}
