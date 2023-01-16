import { Expression } from "./Expression";

export class InferredType extends Expression {

    // dot expressions are always considered resolved.
    public readonly resolved = true;

    toString() {
        return `?`;
    }
}

