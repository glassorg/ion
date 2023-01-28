import { Expression } from "./Expression";

export class InferredType extends Expression {

    public override get resolved() {
        return true;
    }

    toString() {
        return `?`;
    }
}

