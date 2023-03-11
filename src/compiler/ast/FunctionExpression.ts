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

    toString() {
        return `${this.id}${this.toBlockString(this.parameters, "(", ")")}${this.toTypeString(this.returnType)} ${this.body}`;
    }

    get isScope(): true {
        return true;
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

    static createFromLambda(left: Expression, right: Expression): FunctionExpression {
        let type: Type | undefined;
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