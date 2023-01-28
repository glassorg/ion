import { EvaluationContext } from "../EvaluationContext";
import { InfixOperator } from "../Operators";
import { Expression } from "./Expression";
import { Reference } from "./Reference";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { combineTypes } from "../analysis/combineTypes";
import { SemanticError } from "../SemanticError";
import { TypeExpression } from "./TypeExpression";

export class CallExpression extends Expression {

    constructor(
        location: SourceLocation,
        public readonly callee: Expression,
        public readonly args: Expression[],
    ){
        super(location);
    }

    *splitInternal(operator: InfixOperator): Generator<Expression> {
        if (this.callee instanceof Reference && this.callee.name === operator && this.args.length === 2) {
            // if this is a Call representation of a binary expression we still split it.
            yield* this.args[0].splitInternal(operator);
            yield* this.args[1].splitInternal(operator);
        }
        else {
            yield this;
        }
    }

    protected *dependencies(c: EvaluationContext) {
        // console.log(`CallExpression.dependencies ${this.resolved} ${this} ${[this.callee, ...this.args].map(arg => arg.resolved ? 0 : 1).join(",")}`);
        yield this.callee;
        yield* this.args;
    }

    override resolveType(this: CallExpression, c: EvaluationContext): TypeExpression {
        // boom, we have the correctly resolved types.
        const argTypes = this.args.map(arg => c.getType(arg));
        let functionTypes = c.getFunctionTypes(this.callee, argTypes);
        if (Array.isArray(functionTypes)) {
            functionTypes = functionTypes.filter(type => type.value.areArgumentsValid(argTypes) !== false);
            if (functionTypes.length === 0) {
                throw new SemanticError(`${this.callee} Function with these parameters not found`, this);
            }
            const returnTypes = functionTypes.map(declaration => declaration.getReturnType(argTypes, this)).filter(Boolean) as Expression[];
            const resolvedType = combineTypes("||", returnTypes);
            return resolvedType;
        }
        else {
            throw new Error("Not handled yet");
        }
    }

    public toKype(): kype.Expression {
        return new kype.CallExpresssion(this.callee.toKype(), this.args.map(arg => arg.toKype()));
    }

    toString() {
        return `${this.callee}(${this.args.join(", ")})`;
    }

}