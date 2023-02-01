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

    get isAbsolute() {
        return false;
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

    protected override *dependencies(c: EvaluationContext) {
        const declarations = c.getDeclarations(this);
        if (declarations) {
            for (const declaration of declarations) {
                if (declaration.declaredType) {
                    yield declaration.declaredType;
                }
            }
        }
    }

    protected override resolve(this: Reference, c: EvaluationContext): Expression {
        const declarations = c.getDeclarations(this);
        if (declarations == null) {
            console.log(`WTF? ${this}`);
            debugger;
            const foo = c.getDeclarations(this);
        }
        if (declarations.length === 1) {
            const declaration = declarations[0];
            const resolvedType = declaration.declaredType
            if (declaration instanceof ConstantDeclaration) {
                const { value } = declaration;
                if (value instanceof Literal || value instanceof Reference) {
                    return (value as Expression).patch({ resolvedType });
                }
            }
            return this.patch({ resolvedType });
        }
        // this is a multi function so we will consider the type inferred, maybe should be something else?
        return this.patch({ resolvedType: new InferredType(this.location) });
    }

    toString() {
        return isValidId(this.name) ? this.name : ("`" + this.name + "`") + this.toTypeString();
    }

}