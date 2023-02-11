import { Declarator } from "./Declarator";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import { Declaration } from "./Declaration";
import { TypeExpression } from "./TypeExpression";

export enum VariableKind {
    Constant = "const",
    Phi = "phi",
    Var = "var",
    Property = "prop",
    Parameter = "param"
}

export interface VariableOptions {
    kind?: VariableKind;
    type?: TypeExpression;
    value?: Expression;
}

export type ParameterDeclaration = VariableDeclaration & { kind: VariableKind.Parameter };

export function isParameterDeclaration(node: unknown): node is ParameterDeclaration {
    return node instanceof VariableDeclaration && node.kind === VariableKind.Parameter;
}

export function newParameterDeclaration(location: SourceLocation, id: Declarator, type?: TypeExpression, value?: Expression)
{
    return new VariableDeclaration(location, id, { kind: VariableKind.Parameter, type, value }) as ParameterDeclaration;
}

export class VariableDeclaration extends Declaration {

    public readonly kind: VariableKind;
    public readonly value?: Expression;

    constructor(
        location: SourceLocation,
        id: Declarator,
        options: VariableOptions = {},
    ){
        super(location, id, options.type);
        this.kind = options.kind ?? VariableKind.Var;
        this.value = options.value;
    }

    toString() {
        return `${this.toMetaString()}${this.kind} ${this.id}${this.toTypeString()}${this.value ? ` = ${this.value}`: ``}`;
    }

}