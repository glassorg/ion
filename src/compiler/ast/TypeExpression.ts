import { joinExpressions, splitExpressions } from "./AstFunctions";
import { CoreTypes } from "../common/CoreType";
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
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { isType, Type } from "./Type";
import { TypeConstraint } from "./TypeConstraint";
import { TypeReference } from "./TypeReference";

export class TypeExpression extends Expression implements Type {

    constructor(
        location: SourceLocation,
        public readonly proposition: Expression
    ) {
        super(location);
    }

    get isType(): true { return true }

    public toKype(): kype.TypeExpression {
        return new kype.TypeExpression(this.proposition.toKype());
    }

    toString() {
        return `{ ${this.proposition} }`;
    }
}

/**
 * A Type expression is an expression which contains DotExpressions.
 * A value is an instance of a type if when the value is substituted
 * for every dot expression the resulting expression is true.
 * Examples:
 *      Number = Number{}
 *      ZeroToOne = Float{ . >= 0.0 && . <= 1.0 }
 */
export function toTypeExpression(e: Expression): Type {
    if (isType(e)) {
        return e;
    }

    {
        let options = splitExpressions("||", e);
        if (options.length > 1) {
            throw new SemanticError(`Cannot combine types with ||, use |`, e);
        }
        for (let option of options) {
            let terms = splitExpressions("&&", option);
            if (terms.length > 1) {
                throw new SemanticError(`Cannot combine types with &&, use &`, e);
            }
        }
    }
    const result = joinExpressions("|", splitExpressions("|", e).map(option => {
        return joinExpressions("&", splitExpressions("&", option).map(term => {
            if (term instanceof UnaryExpression) {
                switch (term.operator) {
                    case "!=":
                    case ">":
                    case ">=":
                    case "<":
                    case "<=":
                        term = new TypeConstraint(
                            term.location,
                            term.argument instanceof IntegerLiteral ? CoreTypes.Integer : CoreTypes.Float,
                            [
                                new ComparisonExpression(term.location, new DotExpression(term.location), term.operator, term.argument)
                            ]
                        );
                        break;
                    default:
                        console.log(term);
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
                    console.log({ start: start.toString(), finish: finish.toString() })
                    throw new SemanticError(`Range start and finish operators in type expressions must both be numeric literals of the same type`, term);
                }
                if (!(finish.value > start.value)) {
                    throw new SemanticError(`Range finish must be more than start`, term);
                }
                const coreType = start instanceof IntegerLiteral ? CoreTypes.Integer : CoreTypes.Float;
                return new TypeConstraint(
                    term.location,
                    coreType, [
                        new ComparisonExpression(term.location, new DotExpression(term.location), ">=", term.start),
                        new ComparisonExpression(term.location, new DotExpression(term.location), "<", term.finish),
                    ]
                );
            }
            else if (term instanceof Reference) {
                const baseType = term instanceof TypeReference ? term : new TypeReference(term.location, term.name);
                term = new TypeConstraint(term.location, baseType);
            }
            else if (term instanceof Literal) {
                term = new TypeConstraint(
                    term.location,
                    term instanceof IntegerLiteral ? CoreTypes.Integer : CoreTypes.Float,
                    [
                        new ComparisonExpression(term.location, new DotExpression(term.location), "==", term)
                    ]
                )
            }
            return term;
        }));
    }));
    if (!isType(result)) {
        throw new Error(`Expected a Type: ${result}`);
    }
    return result;
}