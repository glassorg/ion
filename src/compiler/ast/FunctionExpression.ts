import { splitExpressions } from "./AstFunctions";
import { getReturnStatements } from "../analysis/getFinalStatements";
import { SemanticError } from "../SemanticError";
import { AstNode } from "./AstNode";
import { BlockStatement } from "./BlockStatement";
import { Expression } from "./Expression";
import { PstGroup } from "./PstGroup";
import { Reference } from "./Reference";
import { ScopeNode } from "./ScopeNode";
import { SourceLocation } from "./SourceLocation";
import { newParameterDeclaration, ParameterDeclaration, VariableDeclaration, VariableKind } from "./VariableDeclaration";
import { Declarator } from "./Declarator";
import { FunctionType } from "./FunctionType";
import { Type } from "./Type";
import { Statement } from "./Statement";


export class FunctionExpression extends Expression implements ScopeNode {

    declare public readonly type: FunctionType;

    /**
     * If true then we want the compiler to check that our
     * declared return type exactly matches our inferred return type.
     */
    public readonly returnTypeExact: boolean = false;

    constructor(
        location: SourceLocation,
        public readonly parameters: ParameterDeclaration[],
        public readonly body: BlockStatement,
        public readonly returnType?: Type,
        public readonly id?: Declarator,
    ) {
        super(location);
    }

    toString(user?: boolean) {
        return `${this.id}${this.toBlockString(user, this.parameters, "(", ")")}${this.toTypeString(this.returnType)} ${this.body.toString(user)}`;
    }

    get isScope(): true {
        return true;
    }

    getStatements(): Statement[] {
        return [...this.body.statements, ...this.parameters];
    }

    areParameterTypesAllResolved() {
        return this.parameterTypes.every(t => t?.resolved === true);
    }
    
    get parameterTypes(): Type[] {
        return this.parameters.map(p => p.type!);
    }

    getReturnStatements() {
        return getReturnStatements(this.body);
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

    static createFromLambda(left: Expression, right: Expression | BlockStatement): FunctionExpression {
        let type: Type | undefined;
        let leftValue = left;
        if (left instanceof PstGroup) {
            leftValue = left.value!;
            type = left.type;
        }
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
        let result = new FunctionExpression(location, parameters, body, type);
        if (left instanceof PstGroup && left.exactType) {
            result = result.patch({ returnTypeExact: true });
        }
        return result;
    }

}