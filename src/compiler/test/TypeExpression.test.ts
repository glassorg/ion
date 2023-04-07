import { strict as assert } from "assert";
import { simplify } from "../analysis/simplify";
import { joinExpressions } from "../ast/AstFunctions";
import { ComparisonExpression } from "../ast/ComparisonExpression";
import { DotExpression } from "../ast/DotExpression";
import { FloatLiteral } from "../ast/FloatLiteral";
import { Identifier } from "../ast/Identifier";
import { MemberExpression } from "../ast/MemberExpression";
import { SourceLocation } from "../ast/SourceLocation";
import { ConstrainedType } from "../ast/ConstrainedType";

const location = SourceLocation.empty;

function createTypeExpression(xMin: number, xMax: number, yMin: number, yMax: number) {
    return new ConstrainedType(location, "Vector", [
        new ComparisonExpression(
            location,
            new MemberExpression(
                location,
                new DotExpression(location),
                new Identifier(location, "x")
            ),
            "is",
            new ConstrainedType(location, "Float", [
                new ComparisonExpression(location, new DotExpression(location), ">=", new FloatLiteral(location, xMin)),
                new ComparisonExpression(location, new DotExpression(location), "<=", new FloatLiteral(location, xMax)),
                new ComparisonExpression(
                    location,
                    new MemberExpression(
                        location,
                        new DotExpression(location),
                        new Identifier(location, "y")
                    ),
                    "is",
                    new ConstrainedType(location, "Float", [
                        new ComparisonExpression(location, new DotExpression(location), ">=", new FloatLiteral(location, yMin)),
                        new ComparisonExpression(location, new DotExpression(location), "<=", new FloatLiteral(location, yMax)),
                    ])
                )
            ])
        )]
    );
}

export async function test() {
    const nestedIsForm = createTypeExpression(0, 10, 20, 30);

    const flatExpressionForm = nestedIsForm.toFlatExpressionForm();
    assert.equal(flatExpressionForm.toString(), `Vector{(@.x is Float),(@.x >= 0.0),(@.x <= 10.0),(@.x.y is Float),(@.x.y >= 20.0),(@.x.y <= 30.0)}`);
    const backToNestedIsForm = flatExpressionForm.toNestedIsForm();
    assert.equal(nestedIsForm.toString(), backToNestedIsForm.toString());

    const simplified1 = simplify(backToNestedIsForm);
    assert.equal(nestedIsForm.toString(), simplified1.toString());

    // create another type
    const nestedIsForm2 = createTypeExpression(5, 15, 25, 35);
    const combined = joinExpressions("&", [nestedIsForm, nestedIsForm2]);
    const simplified2 = simplify(combined);
    assert.equal(simplified2.toString(), `Vector{(@.x is Float{(@ >= 5.0),(@ <= 10.0),(@.y is Float{(@ >= 25.0),(@ <= 30.0)})})}`);

}
