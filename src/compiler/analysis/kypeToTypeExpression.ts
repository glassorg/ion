import * as kype from "@glas/kype";
import { isConsequent } from "@glas/kype";
import { createBinaryExpression, joinExpressions, splitExpressions } from "../ast/AstFunctions";
import { ComparisonExpression } from "../ast/ComparisonExpression";
import { DotExpression, DotExpressionString } from "../ast/DotExpression";
import { Expression } from "../ast/Expression";
import { FloatLiteral } from "../ast/FloatLiteral";
import { FunctionType } from "../ast/FunctionType";
import { IntegerLiteral } from "../ast/IntegerLiteral";
import { MultiFunctionType } from "../ast/MultiFunctionType";
import { Reference } from "../ast/Reference";
import { SourceLocation } from "../ast/SourceLocation";
import { Type } from "../ast/Type";
import { TypeConstraint } from "../ast/TypeConstraint";
import { TypeReference } from "../ast/TypeReference";
import { SemanticError } from "../SemanticError";

export function toExpression(e: kype.Expression, location: SourceLocation): Expression {
    if (e.source instanceof Expression) {
        return e.source;
    }
    if (e instanceof kype.DotExpression) {
        return new DotExpression(location);
    }
    if (e instanceof kype.BinaryExpression) {
        if (e.left instanceof kype.MemberExpression && e.left.property instanceof kype.Reference && e.left.property.name === "class" && e.right instanceof kype.StringLiteral) {
            // this is an assertion of form "left is right";
            return createBinaryExpression(location, toExpression(e.left.object, location), "is", toExpression(e.right, location));
        } 
        return createBinaryExpression(location, toExpression(e.left, location), e.operator as any, toExpression(e.right, location));
    }
    if (e instanceof kype.TypeExpression) {
        return joinExpressions("&", splitExpressions("||", toExpression(e.proposition, location)).map(option => {
            if (option instanceof FunctionType || option instanceof MultiFunctionType) {
                return option;
            }
            let constraints = splitExpressions("&&", option);
            let typeConstraint = constraints.find(c => c instanceof ComparisonExpression && c.operator === "is" && c.left instanceof DotExpression) as ComparisonExpression | undefined;
            if (!typeConstraint) {
                throw new SemanticError(`Expected class constraint: ${e}`, location);
            }
            let otherConstraints = constraints.filter(constraint => constraint !== typeConstraint);
            if (!(typeConstraint.right instanceof TypeReference)) {
                throw new SemanticError(`Expected TypeReference ${typeConstraint.right}`, location);
            }
            return new TypeConstraint(
                location,
                typeConstraint.right,
                otherConstraints
            )
        }));
    }
    // we NEED to know the difference between Integers and Floats.
    if (e instanceof kype.NumberLiteral) {
        if (typeof e.value === "bigint") {
            return new IntegerLiteral(location, e.value);
        }
        else {
            return new FloatLiteral(location, e.value);
        }
    }
    if (e instanceof kype.Reference) {
        if (e.name === DotExpressionString) {
            return new DotExpression(location);
        }
        return new Reference(location, e.name);
    }

    throw new Error(`toTypeExpression from kype Not implemented ${e.constructor.name}`);
}

export function kypeToTypeExpression(type: kype.TypeExpression, location = SourceLocation.empty): Type {
    return toExpression(type, location) as Type;
}
