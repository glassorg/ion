import { EvaluationContext } from "../EvaluationContext";
import { Declaration } from "./Declaration";
import { Declarator } from "./Declarator";
import { Expression } from "./Expression";
import { Identifier } from "./Identifier";
import { ScopeNode } from "./ScopeNode";
import { SourceLocation } from "./SourceLocation";
import { Type } from "./Type";
import { VariableDeclaration } from "./VariableDeclaration";

export class StructDeclaration extends Declaration implements ScopeNode {

    get isScope(): true { return true; }

    constructor(
        location: SourceLocation,
        id: Declarator,
        public readonly fields: VariableDeclaration[]
    ){
        super(location, id);
    }

    get keyword() {
        return "struct";
    }

    getMemberType(property: Identifier | Expression, c: EvaluationContext): Type | null {
        if (property instanceof Identifier) {
            const field = this.fields.find(field => field.id.name === property.name);
            if (!field) {
                return null;
            }
            return field.type!;
        }
        return null;
    }

    toString(user?: boolean) {
        return `${this.toMetaString()}${this.keyword} ${this.id}${this.toBlockString(user, this.fields)}`;
    }

}