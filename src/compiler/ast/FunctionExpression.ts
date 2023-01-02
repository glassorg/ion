import { SemanticError } from "../SemanticError";
import { AstNode } from "./AstNode";
import { BlockStatement } from "./BlockStatement";
import { Declarator } from "./Declarator";
import { Expression } from "./Expression";
import { ParameterDeclaration } from "./ParameterDeclaration";
import { PstGroup } from "./PstGroup";
import { Reference } from "./Reference";
import { Scope } from "./Scope";
import { SourceLocation } from "./SourceLocation";
import { TypeExpression } from "./TypeExpression";
import { VariableDeclaration } from "./VariableDeclaration";

export class FunctionExpression extends Expression implements Scope {

    constructor(
        location: SourceLocation,
        public readonly parameters: ParameterDeclaration[],
        public readonly body: BlockStatement,
        public readonly declaredType?: TypeExpression
    ) {
        super(location);
    }

    toString() {
        return `(${this.parameters.join(", ")})${this.toTypeString(this.declaredType)} => ${this.body}`;
    }

    get isScope(): true {
        return true;
    }

    private static parameterFromNode(node: AstNode): ParameterDeclaration {
        if (node instanceof ParameterDeclaration) {
            return node;
        }
        if (node instanceof Reference) {
            return new ParameterDeclaration(node.location, node.toDeclarator(), null, null);
        }
        if (node instanceof VariableDeclaration) {
            return new ParameterDeclaration(node.location, node.id, node.valueType, node.defaultValue);
        }
        throw new SemanticError(`Expected Parameter`, node);
    }

    static createFromLambda(left?: Expression, right?: Expression): FunctionExpression {
        let declaredType: TypeExpression | undefined;
        if (left instanceof PstGroup) {
            declaredType = left.declaredType;
            left = left.value;
        }
        let parameters = left?.split(",").map(FunctionExpression.parameterFromNode) ?? [];
        let body!: BlockStatement;
        let location!: SourceLocation;
        if (right instanceof BlockStatement) {
            body = right;
        }
        else if (right instanceof Expression) {
            body = new BlockStatement(right.location, [right]);
        }
        return new FunctionExpression(location, parameters, body, declaredType);
    }

}