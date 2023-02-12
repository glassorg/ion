import { splitExpressions } from "./AstFunctions";
import { getFinalStatements } from "../analysis/getFinalStatements";
import { isSubTypeOf } from "../analysis/isSubType";
import { SemanticError } from "../SemanticError";
import { AstNode } from "./AstNode";
import { BlockStatement } from "./BlockStatement";
import { Expression } from "./Expression";
import { PstGroup } from "./PstGroup";
import { Reference } from "./Reference";
import { ReturnStatement } from "./ReturnStatement";
import { ScopeNode } from "./ScopeNode";
import { SourceLocation } from "./SourceLocation";
import { newParameterDeclaration, ParameterDeclaration, VariableDeclaration, VariableKind } from "./VariableDeclaration";
import { TypeExpression } from "./TypeExpression";
import { Declarator } from "./Declarator";
import { nativeFunctionReturnTypes } from "../analysis/nativeFunctionReturnTypes";
import { CallExpression } from "./CallExpression";
import { FunctionType } from "./FunctionType";

export class FunctionExpression extends Expression implements ScopeNode {

    declare public readonly type: FunctionType;

    constructor(
        location: SourceLocation,
        public readonly parameters: ParameterDeclaration[],
        public readonly body: BlockStatement,
        public readonly returnType?: TypeExpression,
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
    
    get parameterTypes(): TypeExpression[] {
        return this.parameters.map(p => p.type!);
    }

    getReturnType(argumentTypes: TypeExpression[], callee: CallExpression): TypeExpression | undefined {
        if (this.type!.areArgumentsValid(argumentTypes) === false) {
            return undefined;
        }
        const name = `${this.id}(${this.parameterTypes.map(p => p?.toUserTypeString()).join(",")})`;
        const nativeFunctionReturnType = nativeFunctionReturnTypes[name];
        if (nativeFunctionReturnType) {
            const result = nativeFunctionReturnType(callee, ...argumentTypes);
            console.log(`FunctionExpression.getReturnType: ${name} \n    ${argumentTypes.join("\n    ")}\n    =>\n    ${result}`);
            return result;
        }
        return this.returnType!;
    }

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