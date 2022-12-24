import { Declarator } from "./Declarator";
import { Expression } from "./Expression";
import { AbstractValueDeclaration } from "./AbstractValueDeclaration";
import { SourceLocation } from "./SourceLocation";
import { EvaluationContext } from "../EvaluationContext";
import { AstNode } from "./AstNode";

export class ConstantDeclaration extends AbstractValueDeclaration {

    constructor(
        location: SourceLocation,
        id: Declarator,
        public readonly value: Expression,
    ) {
        super(location, id, null);
    }

    protected override *dependencies(c: EvaluationContext): Generator<AstNode, any, unknown> {
        yield this.value;
    }

    override resolve(this: ConstantDeclaration, c: EvaluationContext): void | AstNode {
        return this.patch({ declaredType: this.value.resolvedType! });
    }

    toString() {
        return `let ${this.id}${this.value.toTypeString()} = ${this.value}`;
    }

}