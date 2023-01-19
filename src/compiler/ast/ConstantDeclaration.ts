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
        super(location, id);
    }

    protected override *dependencies(c: EvaluationContext): Generator<AstNode, any, unknown> {
        // console.log(`ConstantDeclaration.dependencies ${this.id.name}`, this.value.resolved);
        yield this.value;
    }

    maybeResolve(c: EvaluationContext): void | AstNode {
        // if (this.toString() === "let c = `+`(a, b)") {
        //     console.log(`>>>> ${this.toString()}`);
        //     debugger;
        // }
        if (!this.resolved && this.areAllDependenciesResolved(c)) {
            return (this.resolve(c) ?? this).patch({ resolved: true });
        }
    }

    override resolve(this: ConstantDeclaration, c: EvaluationContext): void | AstNode {
        return this.patch({ resolvedType: this.value.resolvedType! });
    }

    toString() {
        return `let ${this.id}${this.value.toTypeString()} = ${this.value}`;
    }

}