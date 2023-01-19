import { EvaluationContext } from "../EvaluationContext";
import { SemanticError } from "../SemanticError";
import { AstNode } from "./AstNode";
import { BlockStatement } from "./BlockStatement";
import { Expression } from "./Expression";
import { FunctionDeclaration } from "./FunctionDeclaration";
import { FunctionType } from "./FunctionType";
import { ParameterDeclaration } from "./ParameterDeclaration";
import { PstGroup } from "./PstGroup";
import { Reference } from "./Reference";
import { Scope } from "./Scope";
import { SourceLocation } from "./SourceLocation";
import { TypeExpression } from "./TypeExpression";
import { VariableDeclaration } from "./VariableDeclaration";

export class FunctionExpression extends Expression implements Scope, FunctionType {

    constructor(
        location: SourceLocation,
        public readonly parameters: ParameterDeclaration[],
        public readonly body: BlockStatement,
        public readonly declaredReturnType?: TypeExpression,
        public readonly resolvedReturnType?: TypeExpression
    ) {
        super(location);
    }

    toString() {
        return `(${this.parameters.join(", ")})${this.toTypeString(this.declaredReturnType)} => ${this.body}`;
    }

    get isScope(): true {
        return true;
    }
    
    get parameterTypes(): Expression[] {
        return this.parameters.map(p => p.declaredType!);
    }

    protected *dependencies(c: EvaluationContext) {
        yield this.body;
    }

    getReturnType(argumentTypes: TypeExpression[]): TypeExpression {
        return this.resolvedReturnType ?? this.declaredReturnType!;
    }

    private static parameterFromNode(node: AstNode): ParameterDeclaration {
        if (node instanceof ParameterDeclaration) {
            return node;
        }
        if (node instanceof Reference) {
            return new ParameterDeclaration(node.location, node.toDeclarator());
        }
        if (node instanceof VariableDeclaration) {
            return new ParameterDeclaration(node.location, node.id, node.declaredType, node.defaultValue);
        }
        throw new SemanticError(`Expected Parameter`, node);
    }

    static createFromLambda(left: Expression, right: Expression): FunctionExpression {
        let declaredType: TypeExpression | undefined;
        let leftValue = left instanceof PstGroup ? left.value : left;
        let parameters = leftValue?.split(",").map(FunctionExpression.parameterFromNode) ?? [];
        let body: BlockStatement;
        let location = SourceLocation.merge(left.location, right.location);
        if (right instanceof BlockStatement) {
            body = right;
        }
        else if (right instanceof Expression) {
            body = new BlockStatement(right.location, [right]);
        }
        else {
            throw new SemanticError(`Unexpected lambda`, left, right);
        }
        return new FunctionExpression(location, parameters, body, declaredType);
    }

}