import { isValidId } from "../common/names";
import { EvaluationContext } from "../EvaluationContext";
import { AstNode } from "./AstNode";
import { ConstantDeclaration } from "./ConstantDeclaration";
import { Expression } from "./Expression";
import { Literal } from "./Literal";
import { SourceLocation } from "./SourceLocation";
import { UnaryExpression } from "./UnaryExpression";

export class Reference extends Expression {

    constructor(
        location: SourceLocation,
        public readonly name: string,
    ){
        super(location);
    }

    get isReference() {
        return true;
    }

    protected *dependencies(c: EvaluationContext): Generator<AstNode, any, unknown> {
        yield c.getDeclaration(this);
    }

    resolve(this: Reference, c: EvaluationContext): AstNode | void {
        const declaration = c.getDeclaration(this);

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

    toString() {
        return isValidId(this.name) ? this.name : ("`" + this.name + "`");
    }

}