import { joinExpressions, splitExpressions } from "./AstFunctions";
import { CoreTypes } from "../common/CoreType";
import { getTypeAssertion } from "../common/utility";
import { SemanticError } from "../SemanticError";
import { ComparisonExpression } from "./ComparisonExpression";
import { DotExpression } from "./DotExpression";
import { Expression } from "./Expression";
import { FloatLiteral } from "./FloatLiteral";
import { IntegerLiteral } from "./IntegerLiteral";
import { Literal } from "./Literal";
import { RangeExpression } from "./RangeExpression";
import { Reference } from "./Reference";
import { UnaryExpression } from "./UnaryExpression";
import { NumberLiteral } from "./NumberLiteral";
import { simplify } from "../analysis/combineTypes";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { Type } from "./Type";

export class TypeExpression extends Type {

    constructor(
        location: SourceLocation,
        public readonly proposition: Expression
    ) {
        super(location);
    }

    public toKype(): kype.TypeExpression {
        return new kype.TypeExpression(this.proposition.toKype());
    }

    toString() {
        return `{ ${this.proposition} }`;
    }
}

/**
 * A Type expression is an expression which contains DotExpressions.
 * A value is an instance of a type if when the value is substituted for every dot expression
 * the resulting expression is true.
 * Examples:
 *      Number = . is Number
 *      ZeroToOne = . >= 0.0 && . <= 1.0
 */

export function toTypeExpression(e: Expression): TypeExpression {
    if (e instanceof TypeExpression) {
        return e;
    }

    {
        let options = splitExpressions("||", e);
        if (options.length > 1) {
            throw new SemanticError(`Cannot combine types with ||, use |`, e);
        }
    }
    return simplify(
        new TypeExpression(
            e.location,
            joinExpressions("||", splitExpressions("|", e).map(option => {
                return joinExpressions("&&", splitExpressions("&", option).map(term => {
                    if (term instanceof UnaryExpression) {
                        switch (term.operator) {
                            case "!=":
                            case ">":
                            case ">=":
                            case "<":
                            case ">=":
                                const expressions: Expression[] = [
                                    new ComparisonExpression(term.location, new DotExpression(term.location), term.operator, term.argument)
                                ];
                                if (term.argument instanceof NumberLiteral) {
                                    expressions.push(getTypeAssertion(term.argument instanceof IntegerLiteral ? CoreTypes.Integer : CoreTypes.Float, term.location));
                                }
                                term = joinExpressions("&&", expressions);
                                break;
                            default:
                                throw new SemanticError(`Unsupported type expression: ${term}`);
                        }
                    }
                    //  we can't convert to range without knowing
                    else if (term instanceof RangeExpression) {
                        const { start, finish } = term;
                        if (!(
                            ((start instanceof IntegerLiteral) && (finish instanceof IntegerLiteral))
                            ||
                            ((start instanceof FloatLiteral) && (finish instanceof FloatLiteral))
                        )) {
                            // console.log({ start, finish })
                            throw new SemanticError(`Range start and finish operators in type expressions must both be numeric literals of the same type`, term);
                        }
                        if (!(finish.value > start.value)) {
                            throw new SemanticError(`Range finish must be more than start`, term);
                        }
                        const coreType = start instanceof IntegerLiteral ? CoreTypes.Integer : CoreTypes.Float;
                        term = joinExpressions("&&", [
                            new ComparisonExpression(term.location, new DotExpression(term.location), ">=", term.start),
                            new ComparisonExpression(term.location, new DotExpression(term.location), "<", term.finish),
                            getTypeAssertion(coreType, term.location)
                        ]);
                    }
                    else if (term instanceof Reference || term instanceof Literal) {
                        const operator = term instanceof Reference ? "is" : "==";
                        term = new ComparisonExpression(term.location, new DotExpression(term.location), operator, term);
                    }
                    return term;
                }));
            }))
        )
    ) as TypeExpression
}