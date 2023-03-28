import * as kype from "@glas/kype";
import { isAlways, isNever } from "@glas/kype";
import { createBinaryExpression, joinExpressions, splitExpressions } from "../ast/AstFunctions";
import { BinaryExpression } from "../ast/BinaryExpression";
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
import { ConstrainedType } from "../ast/ConstrainedType";
import { TypeReference } from "../ast/TypeReference";
import { CoreTypes } from "../common/CoreType";
import { SemanticError } from "../SemanticError";

export function toIonExpression(e: kype.Expression, location: SourceLocation): Expression {
    if (e.source instanceof Expression) {
        return e.source;
    }
    if (e instanceof kype.DotExpression) {
        return new DotExpression(location);
    }
    if (e instanceof kype.BinaryExpression) {
        if (e.left instanceof kype.MemberExpression && e.left.property instanceof kype.Reference && e.left.property.name === "class" && e.right instanceof kype.StringLiteral) {
            // this is an assertion of form "left is right";
            return createBinaryExpression(location, toIonExpression(e.left.object, location), "is", toIonExpression(e.right, location));
        } 
        return createBinaryExpression(location, toIonExpression(e.left, location), e.operator as any, toIonExpression(e.right, location));
    }
    if (e instanceof kype.TypeExpression) {
        if (isAlways(e)) {
            return new TypeReference(location, CoreTypes.Any);
        }
        if (isNever(e)) {
            return new TypeReference(location, CoreTypes.Never);
        }
        return joinExpressions("|", splitExpressions("||", toIonExpression(e.proposition, location)).map(option => {
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
            let baseType = typeConstraint.right;
            // remove some redundant constraints
            if (baseType.name === CoreTypes.Float) {
                otherConstraints = otherConstraints.filter(e => {
                    if (e instanceof BinaryExpression && e.left instanceof DotExpression) {
                        if (e.operator === "<=" && e.right instanceof FloatLiteral && e.right.value === Number.POSITIVE_INFINITY) {
                            return false;
                        }
                        if (e.operator === ">=" && e.right instanceof FloatLiteral && e.right.value === Number.NEGATIVE_INFINITY) {
                            return false;
                        }
                    }
                    return true;
                })
            }
            if (otherConstraints.length > 0) {
                return new ConstrainedType(
                    location,
                    baseType,
                    otherConstraints
                ).toNestedIsForm();
            }
            else {
                return baseType;
            }
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
    return toIonExpression(type, location) as Type;
}
