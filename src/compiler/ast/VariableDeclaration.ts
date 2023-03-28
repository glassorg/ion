import { Declarator } from "./Declarator";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import { Declaration } from "./Declaration";
import { Type } from "./Type";
import { CallExpression } from "./CallExpression";
import { CoreTypes } from "../common/CoreType";
import { ConstrainedType } from "./ConstrainedType";

export enum VariableKind {
    Constant = "const",
    Phi = "phi",
    Var = "var",
    Property = "prop",
    Parameter = "param",
    Type = "type",
}

export interface VariableOptions {
    kind?: VariableKind;
    type?: Type;
    declaredType?: Type;
    value?: Expression;
    meta?: CallExpression[];
}

export type ParameterDeclaration = VariableDeclaration & { kind: VariableKind.Parameter };

export function isParameterDeclaration(node: unknown): node is ParameterDeclaration {
    return node instanceof VariableDeclaration && node.kind === VariableKind.Parameter;
}

export function newParameterDeclaration(location: SourceLocation, id: Declarator, type?: Type, value?: Expression)
{
    return new VariableDeclaration(location, id, { kind: VariableKind.Parameter, type, value }) as ParameterDeclaration;
}

export interface TypeDeclaration extends VariableDeclaration {
    kind: VariableKind.Type;
    type: ConstrainedType;
    value: Type;
}

export function isTypeDeclaration(value: unknown): value is TypeDeclaration {
    return value instanceof VariableDeclaration && value.kind === VariableKind.Type;
}

export class VariableDeclaration extends Declaration {

    public readonly kind: VariableKind;
    public readonly value?: Expression;
    public readonly declaredType?: Type;

    constructor(
        location: SourceLocation,
        id: Declarator,
        options: VariableOptions = {},
    ){
        super(
            location,
            id,
            (options.kind === VariableKind.Type ? new ConstrainedType(id.location, CoreTypes.Type) : options.type),
            options.meta
        );
        this.kind = options.kind ?? VariableKind.Var;
        this.value = options.value;
        this.declaredType = options.declaredType;
    }

    get isConstant() {
        switch(this.kind) {
            case VariableKind.Constant:
            case VariableKind.Phi:
            case VariableKind.Type:
                return true;
            default:
                return false;
        }
    }

    toString() {
        return `${this.toMetaString()}${this.kind} ${this.id}${this.toTypeString()}${this.value ? ` = ${this.value}`: ``};`;
    }

}