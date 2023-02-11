import { splitExpressions } from "./AstFunctions";
import { getFinalStatements } from "../analysis/getFinalStatements";
import { isSubTypeOf } from "../analysis/isSubType";
import { EvaluationContext } from "../EvaluationContext";
import { SemanticError } from "../SemanticError";
import { AstNode } from "./AstNode";
import { BlockStatement } from "./BlockStatement";
import { Expression } from "./Expression";
import { OldFunctionType } from "./FunctionType";
import { PstGroup } from "./PstGroup";
import { Reference } from "./Reference";
import { ReturnStatement } from "./ReturnStatement";
import { ScopeNode } from "./ScopeNode";
import { SourceLocation } from "./SourceLocation";
import { newParameterDeclaration, ParameterDeclaration, VariableDeclaration, VariableKind } from "./VariableDeclaration";
import { TypeExpression } from "./TypeExpression";

export class FunctionExpression extends Expression implements ScopeNode, OldFunctionType {

    constructor(
        location: SourceLocation,
        public readonly parameters: ParameterDeclaration[],
        public readonly body: BlockStatement,
        public readonly returnType?: TypeExpression,
    ) {
        super(location);
    }

    toString() {
        return `${this.toBlockString(this.parameters, "(", ")")}${this.toTypeString(this.returnType)} ${this.body}`;
    }

    get isScope(): true {
        return true;
    }
    
    get parameterTypes(): TypeExpression[] {
        return this.parameters.map(p => p.type!);
    }

    // protected override *dependencies(c: EvaluationContext) {
    //     for (const statement of this.getReturnStatements()) {
    //         yield statement.argument;
    //     }
    // }

    *getReturnStatements() {
        for (const statement of getFinalStatements(this.body)) {
            if (statement instanceof ReturnStatement) {
                yield statement;
            }
            else {
                throw new SemanticError(`Expected return statement`, statement);
            }
        }
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
        return this.returnType!;
    }

    public static parameterFromNode(node: AstNode): ParameterDeclaration {
        if (node instanceof Reference) {
            return newParameterDeclaration(node.location, node.toDeclarator());
        }
        if (node instanceof VariableDeclaration) {
            return node.patch({ kind: VariableKind.Parameter }) as ParameterDeclaration;
        }
        throw new SemanticError(`Expected Parameter`, node);
    }

    static createFromLambda(left: Expression, right: Expression): FunctionExpression {
        let type: TypeExpression | undefined;
        let leftValue = left instanceof PstGroup ? left.value : left;
        let parameters = splitExpressions(",", leftValue).map(FunctionExpression.parameterFromNode);
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
        return new FunctionExpression(location, parameters, body, type);
    }

}