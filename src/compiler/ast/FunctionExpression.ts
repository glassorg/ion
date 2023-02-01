import { combineTypes } from "../analysis/combineTypes";
import { getFinalStatements } from "../analysis/getFinalStatements";
import { isSubTypeOf } from "../analysis/isSubType";
import { EvaluationContext } from "../EvaluationContext";
import { SemanticError } from "../SemanticError";
import { AstNode } from "./AstNode";
import { BlockStatement } from "./BlockStatement";
import { Expression } from "./Expression";
import { FunctionType } from "./FunctionType";
import { InferredType } from "./InferredType";
import { ParameterDeclaration } from "./ParameterDeclaration";
import { PstGroup } from "./PstGroup";
import { Reference } from "./Reference";
import { ReturnStatement } from "./ReturnStatement";
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
        return `${this.toBlockString(this.parameters, "(", ")")}${this.toTypeString(this.declaredReturnType)} ${this.body}`;
    }

    get isScope(): true {
        return true;
    }
    
    get parameterTypes(): Expression[] {
        return this.parameters.map(p => p.declaredType!);
    }

    protected override *dependencies(c: EvaluationContext) {
        for (const statement of this.getReturnStatements()) {
            yield statement.argument;
        }
    }

    private *getReturnStatements() {
        for (const statement of getFinalStatements(this.body)) {
            if (statement instanceof ReturnStatement) {
                yield statement;
            }
            else {
                throw new SemanticError(`Expected return statement`, statement);
            }
        }
    }

    protected override resolve(this: FunctionExpression, c: EvaluationContext): FunctionExpression {
        const resolvedReturnType = combineTypes("||", [...this.getReturnStatements()].map(s => s.argument.resolvedType!));
        const resolvedType = new InferredType(this.location);
        return this.patch({ resolvedType, resolvedReturnType });
    }

    areArgumentsValid(argumentTypes: TypeExpression[]): boolean | null {
        // if these argumentTypes are not valid arguments for this function we return undefined
        const parameterTypes = this.parameterTypes;
        if (argumentTypes.length !== parameterTypes.length) {
            return false;
        }
        let areAllValid = false;
        for (let i = 0; i < argumentTypes.length; i++) {
            let argType = argumentTypes[i];
            let paramType = parameterTypes[i];
            let isArgValid = isSubTypeOf(argType, paramType);
            if (isArgValid === false) {
                return false;
            }
            if (isArgValid === null) {
                areAllValid = false;
            }
        }
        return areAllValid ? true : null;
    }

    getReturnType(argumentTypes: TypeExpression[], callee: Expression): TypeExpression {
        return this.resolvedReturnType ?? this.declaredReturnType!;
    }

    public static parameterFromNode(node: AstNode): ParameterDeclaration {
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