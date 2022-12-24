import { InfixOperator, isAssignmentOperator, isComparisonOperator, isLogicalOperator } from "../Operators";
import { AssignmentExpression } from "./AssignmentExpression";
import { CallExpression } from "./CallExpression";
import { ComparisonExpression } from "./ComparisonExpression";
import { Expression } from "./Expression";
import { LogicalExpression } from "./LogicalExpression";
import { Reference } from "./Reference";
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
    return new CallExpression(location, new Reference(operatorLocation, operator), [left, right]);
}

export function joinExpressions(operator: InfixOperator, expressions: Expression[]) {
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

