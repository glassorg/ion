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

export class Reference extends Expression {

    constructor(
        location: SourceLocation,
        public readonly name: string,
    ){
        super(location);
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

    protected *dependencies(c: EvaluationContext): Generator<AstNode, any, unknown> {
        const declarations = c.getDeclarations(this);
        if (declarations) {
            for (const declaration of declarations) {
                yield declaration;
            }
        }
    }

    resolve(this: Reference, c: EvaluationContext): AstNode | void {
        const declarations = c.getDeclarations(this);
        if (declarations.length === 1) {
            const declaration = declarations[0];
            const resolvedType = declaration.declaredType instanceof UnaryExpression
                ? declaration.declaredType
                : new UnaryExpression(
                    this.location,
                    "typeof",
                    this.patch({ resolved: true })
                );

            if (declaration instanceof ConstantDeclaration) {
                const { value } = declaration;
                if (value instanceof Literal || value instanceof Reference) {
                    return (value as Expression).patch({ resolvedType });
                }
            }
            if (this.resolvedType === undefined) {
                return this.patch({ resolvedType });
            }
        }
    }

    toString() {
        return isValidId(this.name) ? this.name : ("`" + this.name + "`");
    }

}