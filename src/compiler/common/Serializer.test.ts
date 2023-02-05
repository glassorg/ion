import { strict as assert } from "assert";
import { Serializer } from "./Serializer";
import * as astNamespace from "../ast/AstNamespace";
import { ComparisonExpression } from "../ast/ComparisonExpression";
import { DotExpression, LogicalExpression, Reference, SourceLocation } from "../ast/AstNamespace";
import { joinExpressions } from "../ast/AstFunctions";

const serializer = new Serializer(astNamespace, { indent: 2 });

const location = new SourceLocation("fake", 0, 0, 0, 0, 0, 0);

const ast = joinExpressions("&&", [
    new ComparisonExpression(location, new DotExpression(location), ">", new Reference(location, "a")),
    new LogicalExpression(location, new DotExpression(location), "||", new Reference(location, "b")),
]);

const serialized1 = serializer.stringify(ast);
const parsed = serializer.parse(serialized1);
const serialized2 = serializer.stringify(parsed);

assert.equal(serialized1, serialized2);
