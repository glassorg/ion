import { InfixOperator, isAssignmentOperator, isComparisonOperator, isLogicalOperator, isSequenceOperator } from "../Operators";
import { AssignmentExpression } from "./AssignmentExpression";
import { BinaryExpression } from "./BinaryExpression";
import { CallExpression } from "./CallExpression";
import { ComparisonExpression } from "./ComparisonExpression";
import { Expression } from "./Expression";
import { LogicalExpression } from "./LogicalExpression";
import { Reference } from "./Reference";
import { SequenceExpression } from "./SequenceExpression";
import { SourceLocation } from "./SourceLocation";

export function createBinaryExpression(location: SourceLocation, left: Expression, operator: InfixOperator, right: Expression, operatorLocation = location) {
    if (isAssignmentOperator(operator)) {
        if (operator !== "=") {
            right = createBinaryExpression(location, left, operator.slice(0, -1) as InfixOperator, right);
        }
        return new AssignmentExpression(location, left, right);
    }
    if (isComparisonOperator(operator)) {
        return new ComparisonExpression(location, left, operator, right);
    }
    if (isLogicalOperator(operator)) {
        return new LogicalExpression(location, left, operator, right);
    }
    if (isSequenceOperator(operator)) {
        return new SequenceExpression(location, left, operator, right);
    }
    // return new CallExpression(
    //     location,
    //     new MemberExpression(
    //         SourceLocation.merge(left.location, operatorLocation),
    //         left,
    //         new Identifier(operatorLocation, operator)
    //     ),
    //     [right]
    // )
    return new CallExpression(location, new Reference(operatorLocation, operator), [left, right]);
}

export function joinExpressions(operator: InfixOperator, expressions: Expression[]): Expression {
    let right = expressions[expressions.length - 1];
    for (let i = expressions.length - 2; i >= 0; i--) {
        const left = expressions[i];
        right = createBinaryExpression(
            left.location.merge(right.location),
            left,
            operator,
            right
        );
    }
    return right;
}

export function splitExpressions(operator: InfixOperator, expression: Expression | undefined, expressions: Expression[] = []): Expression[] {
    if (expression instanceof BinaryExpression && expression.operator === operator) {
        splitExpressions(operator, expression.left, expressions);
        splitExpressions(operator, expression.right, expressions);
    }
    else if (expression != null) {
        expressions.push(expression);
    }
    return expressions;
}
