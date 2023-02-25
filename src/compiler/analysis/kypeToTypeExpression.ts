import * as kype from "@glas/kype";
import { createBinaryExpression } from "../ast/AstFunctions";
import { DotExpression, DotExpressionString } from "../ast/DotExpression";
import { Expression } from "../ast/Expression";
import { FloatLiteral } from "../ast/FloatLiteral";
import { IntegerLiteral } from "../ast/IntegerLiteral";
import { Reference } from "../ast/Reference";
import { SourceLocation } from "../ast/SourceLocation";

function toExpression(e: kype.Expression, location: SourceLocation): Expression {
    if (e.source instanceof Expression) {
        return e.source;
    }
    if (e instanceof kype.DotExpression) {
        return new DotExpression(location);
    }
    if (e instanceof kype.BinaryExpression) {
        if (e.left instanceof kype.MemberExpression && e.left.property instanceof kype.Reference && e.left.property.name === "class" && e.right instanceof kype.StringLiteral) {
            // this is an assertion of form "left is right";
            return createBinaryExpression(location, toExpression(e.left.object, location), "is", new Reference(location, e.right.value));
        } 
        return createBinaryExpression(location, toExpression(e.left, location), e.operator as any, toExpression(e.right, location));
    }
    if (e instanceof kype.TypeExpression) {
        throw new Error(`didn't expect a kype type expression`);
        // return toTypeExpression(toExpression(e.proposition, location));
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

export function kypeToTypeExpression(type: kype.TypeExpression, location = SourceLocation.empty) {
    return toExpression(type.proposition, location);
}
