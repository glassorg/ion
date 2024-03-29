import { CoreTypes } from "../common/CoreType";
import { EvaluationContext } from "../EvaluationContext";
import { SemanticError } from "../SemanticError";
import { joinExpressions, splitExpressions } from "./AstFunctions";
import { ComparisonExpression } from "./ComparisonExpression";
import { DotExpression } from "./DotExpression";
import { Expression } from "./Expression";
import { IntegerLiteral } from "./IntegerLiteral";
import { Literal } from "./Literal";
import { RangeExpression } from "./RangeExpression";
import { Reference } from "./Reference";
import { ConstrainedType } from "./ConstrainedType";
import { UnaryExpression } from "./UnaryExpression";
import { TypeReference } from "./TypeReference";
import { type Identifier } from "./Identifier";
import { TypeofExpression } from "./TypeofExpression";

export function isType(node: unknown): node is Type {
    const maybe = node as Partial<Type>;
    return maybe.isType === true;
}

export interface Type extends Expression {
    isType: true;
    getMemberType(property: Identifier | Expression, c: EvaluationContext): Type | null;
    getClass(c: EvaluationContext): Type;
}

export function isAny(type: unknown) {
    return type instanceof TypeReference && type.name === CoreTypes.Any;
}

export function isNever(type: unknown) {
    return type instanceof TypeReference && type.name === CoreTypes.Never;
}

export function isBaseType(type: Type, name: string): boolean {
    if (type instanceof TypeReference) {
        return type.name === name;
    }
    if (type instanceof ConstrainedType) {
        return isBaseType(type.baseType, name);
    }
    return false;
}

/**
 * A Type expression is an expression which contains DotExpressions.
 * A value is an instance of a type if when the value is substituted
 * for every dot expression the resulting expression is true.
 * Examples:
 *      Number = Number{}
 *      ZeroToOne = Float{ . >= 0.0 && . <= 1.0 }
 */
 export function toType(e: Expression): Type {
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
                        term = new ConstrainedType(
                            term.location,
                            // use classof argument
                            new TypeofExpression(term.location, term.argument, "classof"),
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
                // const { start, finish } = term;
                // if (!(
                //     ((start instanceof IntegerLiteral) && (finish instanceof IntegerLiteral))
                //     ||
                //     ((start instanceof FloatLiteral) && (finish instanceof FloatLiteral))
                // )) {
                //     console.log({ start: start.toString(), finish: finish.toString() })
                //     throw new SemanticError(`Range start and finish operators in type expressions must both be numeric literals of the same type`, term);
                // }
                // if (!(finish.value > start.value)) {
                //     throw new SemanticError(`Range finish must be more than start`, term);
                // }
                const coreType = term.start instanceof IntegerLiteral ? CoreTypes.Integer : CoreTypes.Float;
                return new ConstrainedType(
                    term.location,
                    coreType, [
                        new ComparisonExpression(term.location, new DotExpression(term.location), (term.minExclusive ? ">" : ">="), term.start),
                        new ComparisonExpression(term.location, new DotExpression(term.location), (term.maxExclusive ? "<" : "<="), term.finish),
                    ]
                );
            }
            else if (term instanceof Reference) {
                term = term instanceof TypeReference ? term : new TypeReference(term.location, term.name);
                // should NOT need a constrained type here.
                // term = new ConstrainedType(term.location, baseType);
            }
            else if (term instanceof Literal) {
                term = new ConstrainedType(
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