import { joinExpressions } from "../ast";
import { BlockStatement } from "../ast/BlockStatement";
import { ComparisonExpression } from "../ast/ComparisonExpression";
import { DotExpression } from "../ast/DotExpression";
import { Expression } from "../ast/Expression";
import { Reference } from "../ast/Reference";
import { SourceLocation } from "../ast/SourceLocation";
import { Statement } from "../ast/Statement";
import { toTypeExpression, TypeExpression } from "../ast/TypeExpression";
import { ComparisonOperator, ComparisonOperators, isComparisonOperator, LogicalOperator } from "../Operators";
import { traverse } from "./traverse";

function getLastBlockNode(maybeBlock: Statement): Statement {
    if (maybeBlock instanceof BlockStatement) {
        return getLastBlockNode(maybeBlock.statements[maybeBlock.statements.length - 1]);
    }
    return maybeBlock;
}

export function splitFilterJoinMultiple(root: Expression, splitOperators: LogicalOperator[], joinOperators: LogicalOperator[], filter: (e: Expression) => Expression | null): Expression {
    let splitOperator = splitOperators[0];
    let joinOperator = joinOperators[0];
    let remainingSplitOperators = splitOperators.slice(1);
    let remainingJoinOperators = joinOperators.slice(1);
    let useFilter = remainingSplitOperators.length === 0
        ? filter
        : ((e: Expression) => splitFilterJoinMultiple(e, remainingSplitOperators, remainingJoinOperators, filter));
    let expressions = [...root.split(splitOperator)].map(useFilter).map(node => getLastBlockNode(node!)).filter(Boolean) as Expression[]
    return joinExpressions(joinOperator, expressions);
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

function isDot(e: Expression, dot: Expression) {
    return e.toString() === dot.toString();
}

export function hasDot(root: Expression, dot: Expression) {
    if (isDot(root, dot)) {
        return true;
    }
    let found = false;
    traverse(root, {
        skip(node) {
            return found || node instanceof SourceLocation;
        },
        enter(node) {
            if (isDot(node, dot)) {
                found = true;
            }
        }
    });
    return found;
}

export function expressionToType(e: Expression, dot: Expression, negate: boolean): TypeExpression | null {
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
            if (isDot(left, dot)) {
                if (negate) {
                    if (!ComparisonOperators[operator].negate) {
                        throw new Error(`Found no negate for ${operator}`);
                    }
                    operator = ComparisonOperators[operator].negate as ComparisonOperator;
                }
                return new ComparisonExpression(e.location, new DotExpression(e.left.location), operator, right);
            }
            else {
                // //  TODO: This next
                // //  then figure out how to handle sample.ion thingy
                // if (left instanceof MemberExpression) {
                //     // console.log({
                //     //     leftObject: left.object.toString(),
                //     //     dot: dot.toString()
                //     // });
                //     if (left.object.toString() === dot.toString()) {
                //         // console.log("------------: " + left.object + " ?? " + dot);
                //         if (compareOperators[operator]) {
                //             let rightType = compareOperators[operator].toType(right);
                //             let newObjectType = new ObjectType({
                //                 location: e.location,
                //                 properties: [new Pair({
                //                     location: e.location,
                //                     key: left.property as Type,
                //                     value: rightType
                //                 })]
                //             });
                //             return newObjectType;
                //         }
                //     }
                // }
                console.log("Handle your nested shit here: ", { left: left.toString(), e: e.toString() } );
            }
        }
    }
    return null;
}

export function getTypeAssertion(absolutePathName: string, location = SourceLocation.empty) {
    return toTypeExpression(new Reference(location, absolutePathName));
}