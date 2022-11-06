import { InfixOperator, isAssignmentOperator, isLogicalOperator } from "../Operators";
import { Position } from "../PositionFactory";
import { AssignmentExpression } from "./AssignmentExpression";
import { CallExpression } from "./CallExpression";
import { Expression } from "./Expression";
import { LogicalExpression } from "./LogicalExpression";
import { Reference } from "./Reference";

export function createBinaryExpression(position: Position, left: Expression, operator: InfixOperator, right: Expression) {
    if (isAssignmentOperator(operator)) {
        if (operator !== "=") {
            right = createBinaryExpression(position, left, operator.slice(0, -1) as InfixOperator, right);
        }
        return new AssignmentExpression(position, left, right);
    }
    if (isLogicalOperator(operator)) {
        return new LogicalExpression(position, left, operator, right);
    }
    return new CallExpression(position, new Reference(position, operator), [left, right]);
}
