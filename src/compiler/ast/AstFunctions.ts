import { InfixOperator, isAssignmentOperator, isComparisonOperator, isLogicalOperator, isSequenceOperator } from "../Operators";
import { AssignmentExpression } from "./AssignmentExpression";
import { BinaryExpression } from "./BinaryExpression";
import { CallExpression } from "./CallExpression";
import { ComparisonExpression } from "./ComparisonExpression";
import { CompositeType } from "./CompositeType";
import { Expression } from "./Expression";
import { LogicalExpression } from "./LogicalExpression";
import { Reference } from "./Reference";
import { SequenceExpression } from "./SequenceExpression";
import { SourceLocation } from "./SourceLocation";
import { isType, Type } from "./Type";

export function createBinaryExpression(location: SourceLocation, left: Expression, operator: InfixOperator, right: Expression, operatorLocation = location) {
    let e = createBinaryExpressionInternal(location, left, operator, right, operatorLocation);
    if (e instanceof BinaryExpression && operatorLocation !== location) {
        e = e.patch({ operatorLocation });
    }
    return e;
}

function createBinaryExpressionInternal(location: SourceLocation, left: Expression, operator: InfixOperator, right: Expression, operatorLocation = location) {
    if (isAssignmentOperator(operator)) {
        return new AssignmentExpression(location, left, right, operator);
    }
    if (isComparisonOperator(operator)) {
        return new ComparisonExpression(location, left, operator, right);
    }
    if (isLogicalOperator(operator)) {
        if (isType(left) && isType(right) && (operator === "&" || operator === "|")) {
            return new CompositeType(location, left, operator, right);
        }
        return new LogicalExpression(location, left, operator, right);
    }
    if (isSequenceOperator(operator)) {
        return new SequenceExpression(location, left, operator, right);
    }
    return new CallExpression(location, new Reference(operatorLocation, operator), [left, right]);
}

export function joinExpressions(operator: "|" | "&", expressions: Type[]): Type
export function joinExpressions(operator: InfixOperator, expressions: Expression[]): Expression
export function joinExpressions(operator: InfixOperator, expressions: Expression[]): Expression {
    if (expressions.length === 2 && expressions[1] === undefined) {
        debugger;
    }
    try {
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
    catch (e) {
        console.log(expressions);
        throw "shit";
    }
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

