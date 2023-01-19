import { EvaluationContext } from "../EvaluationContext";
import { InfixOperator } from "../Operators";
import { AstNode } from "./AstNode";
import { Expression } from "./Expression";
import { Reference } from "./Reference";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { combineTypes } from "../analysis/combineTypes";

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

    resolve(this: CallExpression, c: EvaluationContext): void | AstNode {
        // boom, we have the correctly resolved types.
        const argTypes = this.args.map(arg => c.getType(arg));
        const functionTypes = c.getFunctionTypes(this.callee, argTypes);
        if (Array.isArray(functionTypes)) {
            // console.log("FOUND TYPES", functionTypes.join("\n"));
            const returnTypes = functionTypes.map(declaration => declaration.getReturnType(argTypes));
            const resolvedType = combineTypes("||", returnTypes);
            return this.patch({ resolvedType });
        }
        else {
            throw new Error("Not handled yet");
        }
        // For the native math operations, we are ready to use kype to resolve their types.
        // console.log(argTypes.join("\n"));
        // console.log(functionTypes.join("\n"));
        // console.log("-----> " + this);
    }

    public toKype(): kype.Expression {
        return new kype.CallExpresssion(this.callee.toKype(), this.args.map(arg => arg.toKype()));
    }

    toString() {
        return `${this.callee}(${this.args.join(", ")})`;
    }

}