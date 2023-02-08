import { isValidId } from "../common/names";
import { EvaluationContext } from "../EvaluationContext";
import { AstNode } from "./AstNode";
import { ConstantDeclaration } from "./ConstantDeclaration";
import { Declarator } from "./Declarator";
import { Expression } from "./Expression";
import { Literal } from "./Literal";
import { SourceLocation } from "./SourceLocation";
import { UnaryExpression } from "./UnaryExpression";
import * as kype from "@glas/kype";
import { InferredType } from "./InferredType";
import { CoreType, isCoreType } from "../common/CoreType";

export class Reference extends Expression {

    constructor(
        location: SourceLocation,
        public readonly name: string,
    ){
        super(location);
        if (this.name == null) {
            throw new Error(`Missing name`);
        }
        if (this.name === "`sample.Integer`") {
            debugger;
        }
    }

    get isReference() {
        return true;
    }

    public toKype(): kype.Expression {
        return new kype.Reference(this.name);
    }

    toDeclarator() {
        return new Declarator(this.location, this.name);
    }

    override get resolved() {
        if (isCoreType(this.name)) {
            return true;
        }
        return super.resolved;
    }

    toString(includeTypes = true) {
        return (isValidId(this.name) ? this.name : ("`" + this.name + "`")) + (includeTypes ? this.toTypeString(this.resolvedType, "::") : "");
    }

}