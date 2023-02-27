import { combineTypes } from "../analysis/combineTypes";
import { EvaluationContext } from "../EvaluationContext";
import { SemanticError } from "../SemanticError";
import { CallExpression } from "./CallExpression";
import { Expression } from "./Expression";
import { FunctionExpression } from "./FunctionExpression";
import { Reference } from "./Reference";
import { SourceLocation } from "./SourceLocation";
import { TypeInterface } from "./TypeExpression";

export class MultiFunction extends Expression {

    constructor(
        public readonly functions: Reference[],
    ) {
        super(SourceLocation.empty);
    }

    toString() {
        return `multifunction ${this.toBlockString(this.functions, "[", "]")}`;
    }

    getReturnType(argTypes: TypeInterface[], c: EvaluationContext, callee: CallExpression): TypeInterface {
        const functions = this.functions.map(func => c.getConstantValue(func)) as FunctionExpression[];
        const returnTypes = functions.map(declaration => declaration.getReturnType(argTypes, callee)).filter(Boolean) as Expression[];
        if (returnTypes.length === 0) {
            throw new SemanticError(`${callee} Function with these parameters not found (${argTypes.map(arg => arg.toUserTypeString()).join(",")})`, callee);
        }
        const type = combineTypes("||", returnTypes);
        return type;
    }

}