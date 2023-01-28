import { EvaluationContext } from "../EvaluationContext";
import { AstNode } from "./AstNode";
import { BinaryExpression } from "./BinaryExpression";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";

export class AssignmentExpression extends BinaryExpression {

    constructor(
        location: SourceLocation,
        left: Expression,
        right: Expression,
    ){
        super(location, left, "=", right);
    }

    override *dependencies(c: EvaluationContext) {
        yield this.right;
    }

    override resolve(this: AssignmentExpression, c: EvaluationContext) {
        return this.patch({ resolvedType: this.right.resolvedType! });
    }

}