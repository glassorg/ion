import { strict as assert } from "assert";
import { ComparisonExpression } from "../ast/ComparisonExpression";
import { DotExpression } from "../ast/DotExpression";
import { FloatLiteral } from "../ast/FloatLiteral";
import { Identifier } from "../ast/Identifier";
import { MemberExpression } from "../ast/MemberExpression";
import { SourceLocation } from "../ast/SourceLocation";
import { TypeExpression } from "../ast/TypeExpression";

export async function test() {

    const location = SourceLocation.empty;
    
    const nestedIsForm = new TypeExpression(location, "Vector", [
        new ComparisonExpression(
            location,
            new MemberExpression(
                location,
                new DotExpression(location),
                new Identifier(location, "x")
            ),
            "is",
            new TypeExpression(location, "Float", [
                new ComparisonExpression(location, new DotExpression(location), ">=", new FloatLiteral(location, 0.0)),
                new ComparisonExpression(location, new DotExpression(location), "<=", new FloatLiteral(location, 1.0)),
                new ComparisonExpression(
                    location,
                    new MemberExpression(
                        location,
                        new DotExpression(location),
                        new Identifier(location, "y")
                    ),
                    "is",
                    new TypeExpression(location, "Float", [
                        new ComparisonExpression(location, new DotExpression(location), ">=", new FloatLiteral(location, 2.0)),
                        new ComparisonExpression(location, new DotExpression(location), "<=", new FloatLiteral(location, 3.0)),                        
                    ])
                )
            ])
        )]
    );

    const flatExpressionForm = nestedIsForm.toFlatExpressionForm();
    // console.log(nestedIsForm + " ----------> " + flatExpressionForm);
    assert.equal(flatExpressionForm.toString(), `Vector{(@.x is Float),(@.x >= 0.0),(@.x <= 1.0),(@.x.y is Float),(@.x.y >= 2.0),(@.x.y <= 3.0)}`);
    const backToNestedIsForm = flatExpressionForm.toNestedIsForm();
    // console.log(flatExpressionForm + " ----------> " + backToNestedIsForm);
    assert.equal(nestedIsForm.toString(), backToNestedIsForm.toString());

}
