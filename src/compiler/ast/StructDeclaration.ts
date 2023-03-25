import { Declaration } from "./Declaration";
import { Declarator } from "./Declarator";
import { ScopeNode } from "./ScopeNode";
import { SourceLocation } from "./SourceLocation";
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

    toString() {
        return `${this.toMetaString()}${this.keyword} ${this.id}${this.toBlockString(this.fields)}`;
    }

}