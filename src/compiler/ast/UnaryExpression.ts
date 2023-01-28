import { PrefixOperator } from "../Operators";
import { Expression } from "./Expression";
import { Reference } from "./Reference";
import { SourceLocation } from "./SourceLocation";
import { TypeExpression } from "./TypeExpression";
import * as kype from "@glas/kype";
import { SemanticError } from "../SemanticError";
import { EvaluationContext } from "../EvaluationContext";
import { AstNode } from "./AstNode";

export function isTypeof(node: TypeExpression): node is (UnaryExpression & { operator: "typeof", argument: Reference }) {
    return node instanceof UnaryExpression && node.operator === "typeof" && node.argument instanceof Reference;
}

export class UnaryExpression extends Expression {

    constructor(
        location: SourceLocation,
        public readonly operator: PrefixOperator,
        public readonly argument: Expression,
    ){
        super(location);
    }

    protected override *dependencies(c: EvaluationContext) {
        yield this.argument;
    }

    protected override resolveType(this: UnaryExpression, c: EvaluationContext) {
        return this.argument.resolvedType!
    }

    public toKype(): kype.Expression {
        if (this.operator === "typeof") {
            const argumentType = this.argument.resolvedType;
            if (!argumentType) {
                debugger;
                console.log(this.argument);
                throw new Error(`Expected this to be resolved for typeof`);
            }
            return this.argument.resolvedType!.toKype();
        }
        return new kype.UnaryExpression(this.operator, this.argument.toKype());
    }

    toString() {
        return `${this.operator} ${this.argument}`;
    }

}