import { joinExpressions, splitExpressions } from "../ast/AstFunctions";
import { AstNode } from "../ast/AstNode";
import { BlockStatement } from "../ast/BlockStatement";
import { ComparisonExpression } from "../ast/ComparisonExpression";
import { DotExpression } from "../ast/DotExpression";
import { Expression } from "../ast/Expression";
import { SourceLocation } from "../ast/SourceLocation";
import { Statement } from "../ast/Statement";
import { Type } from "../ast/Type";
import { ConstrainedType } from "../ast/ConstrainedType";
import { ComparisonOperator, ComparisonOperators, isComparisonOperator, LogicalOperator } from "../Operators";
import { skip, traverse } from "./traverse";

function getLastBlockNode(maybeBlock: Statement): Statement {
    if (maybeBlock instanceof BlockStatement) {
        return getLastBlockNode(maybeBlock.statements[maybeBlock.statements.length - 1]);
    }
    return maybeBlock as Statement;
}

export function splitFilterJoinMultiple(root: Expression, splitOperators: LogicalOperator[], joinOperators: LogicalOperator[], filter: (e: Expression) => Expression | null): Expression
export function splitFilterJoinMultiple(root: Type, splitOperators: LogicalOperator[], joinOperators: LogicalOperator[], filter: (e: Expression) => Expression | null): Type
export function splitFilterJoinMultiple(root: Expression, splitOperators: LogicalOperator[], joinOperators: LogicalOperator[], filter: (e: Expression) => Expression | null): Expression {
    let splitOperator = splitOperators[0];
    let joinOperator = joinOperators[0];
    let remainingSplitOperators = splitOperators.slice(1);
    let remainingJoinOperators = joinOperators.slice(1);
    let useFilter = remainingSplitOperators.length === 0
        ? filter
        : ((e: Expression) => splitFilterJoinMultiple(e, remainingSplitOperators, remainingJoinOperators, filter));
    let expressions = splitExpressions(splitOperator, root).map(useFilter).map(node => getLastBlockNode(node!)).filter(Boolean) as Expression[];
    let result = joinExpressions(joinOperator, expressions);
    return result;
}

// function getComparisonOperationProperties(e: Expression): { left: Expression, operator: string, right: Expression } | null {
//     if (e instanceof ComparisonExpression) {
//         return e;
//     }
//     // if (e instanceof BinaryExpression && compareOperators[e.operator] != null) {
//     //     return e;
//     // }
//     // if (e instanceof Call && e.nodes.length === 2 && e.callee instanceof Reference && compareOperators[e.callee.name] != null) {
//     //     return { left: e.nodes[0], right: e.nodes[1], operator: e.callee.name };
//     // }
//     return null;    
// }

function isEquivalent(e: Expression, dot: Expression) {
    return e.toString(false) === dot.toString(false);
}

export function hasDot(root: Expression, dot: Expression) {
    if (isEquivalent(root, dot)) {
        return true;
    }
    let found = false;
    traverse(root, {
        skip(node) {
            return found || node instanceof SourceLocation;
        },
        enter(node) {
            if (isEquivalent(node, dot)) {
                found = true;
            }
        }
    });
    return found;
}

export function replaceDotExpressions(root: Expression, replacement: Expression): Expression {
    return traverse(root, {
        enter(node) {
            if (node instanceof ConstrainedType) {
                //  we skip type expressions because we don't
                //  want to replace their child dot expressions
                //  their dot expressions are bound to them
                return skip;
            }
        },
        leave(node) {
            if (node instanceof DotExpression) {
                return replacement;
            }
        }
    })
}
export function expressionToType(e: Expression, dot: Expression, negate: boolean): Expression | null {
    //  if this is a Block, it could have been created just to hold a conditional assertion
    //  replace it with the last node in the block.
    if (e instanceof ComparisonExpression) {
        let { left, right } = e;
        let operator: ComparisonOperator = e.operator;

        let leftHasDot = hasDot(left, dot);
        let rightHasDot = hasDot(right, dot);
        if (rightHasDot && !leftHasDot) {
            let { reflect } = ComparisonOperators[operator]
            // compareOperators[operator];
            if (reflect) {
                // swap left to right
                [left, right] = [right, left];
                operator = reflect as ComparisonOperator;
                [leftHasDot, rightHasDot] = [rightHasDot, leftHasDot];
            }
        }
        if (leftHasDot) {
            if (isEquivalent(left, dot)) {
                if (negate) {
                    if (!ComparisonOperators[operator].negate) {
                        throw new Error(`Found no negate for ${operator}`);
                    }
                    operator = ComparisonOperators[operator].negate as ComparisonOperator;
                }
                return new ComparisonExpression(e.location, new DotExpression(e.left.location), operator, right);
            }
            else {
                console.log("Handle your nested shit here: ", { left: left.toString(), e: e.toString() } );
            }
        }
    }
    return null;
}

const logged = new Set<string>();
export function logOnce(message = "undefined") {
    if (!logged.has(message)) {
        logged.add(message);
        console.log(message);
    }
}