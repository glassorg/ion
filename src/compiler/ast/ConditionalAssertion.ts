import { combineTypes } from "../analysis/combineTypes";
import { isSubTypeOf } from "../analysis/isSubType";
import { expressionToType, splitFilterJoinMultiple } from "../common/utility";
import { EvaluationContext } from "../EvaluationContext";
import { LogicalOperator } from "../Operators";
import { SemanticError } from "../SemanticError";
import { CallExpression } from "./CallExpression";
import { Expression } from "./Expression";
import { IfStatement } from "./IfStatement";
import { LogicalExpression } from "./LogicalExpression";
import { Reference } from "./Reference";
import { SourceLocation } from "./SourceLocation";
import { TypeExpression } from "./TypeExpression";

export class ConditionalAssertion extends Expression {

    constructor(
        location: SourceLocation,
        public readonly value: Reference,
        public readonly negate: boolean,
        public readonly isChained = false
    ) {
        super(location);
    }

    getKnownTrueExpression(c: EvaluationContext): Expression {
        if (this.isChained) {
            let parentExpression = c.lookup.findAncestor(this, LogicalExpression)!;
            let { left, right } = parentExpression;
            return left;
        }
        let cond = c.lookup.findAncestor(this, IfStatement)!;
        return cond.test;
    }

    override *dependencies(c: EvaluationContext) {
        // console.log("Checking ConditionalAssertion dependencies", this.value);
        yield this.value;
        //  I'm not sure we need to know the type on this before inferring
        yield this.getKnownTrueExpression(c);
    }

    override resolveType(this: ConditionalAssertion, c: EvaluationContext): TypeExpression {
        const test = this.getKnownTrueExpression(c);
        const splitOps: LogicalOperator[] = ["||", "&&"];
        let joinOps = splitOps.slice(0);
        if (this.negate) {
            joinOps.reverse();
        }
        let type = this.value.resolvedType!;
        let assertedType = splitFilterJoinMultiple(test, splitOps, joinOps, e => expressionToType(e, this.value, this.negate));
        if (assertedType) {
            if (assertedType instanceof CallExpression) {
                splitFilterJoinMultiple(test, splitOps, joinOps, e => expressionToType(e, this.value, this.negate));
            }
            const isAssertedConsequent = isSubTypeOf(type, assertedType);
            if (isAssertedConsequent === false) {
                throw new SemanticError(`If test will always evaluate to false`, test);
            }
            if (isAssertedConsequent === true) {
                throw new SemanticError(`If test will always evaluate to true`, test);
            }
            // if this conditional lets us assert a more specific type then we add it.
            type = combineTypes("&&", [type, assertedType]);
        }
        return type;
    }

    toString() {
        if (this.resolvedType) {
            return `cond ${this.resolvedType}`;
        }
        else {
            return `cond ${this.negate ? `!` : ``}${this.value}`;
        }
    }

}
