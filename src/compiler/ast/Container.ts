import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";

export abstract class Container<T extends Expression> extends Expression {

    constructor(
        location: SourceLocation,
        public readonly nodes: T[],
    ){
        super(location);
    }

}