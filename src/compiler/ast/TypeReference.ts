import { Reference } from "./Reference";
import { Type } from "./Type";
import { toKypeCheck } from "./BinaryExpression";
import { DotExpression } from "./DotExpression";
import * as kype from "@glas/kype";
import { SourceLocation } from "./SourceLocation";
import { Identifier } from "./Identifier";
import { EvaluationContext } from "../EvaluationContext";
import { type Expression } from "./Expression";
import { isTypeDeclaration } from "./VariableDeclaration";
import { StructDeclaration } from "./StructDeclaration";
import { CoreTypes } from "../common/CoreType";
import { SemanticError } from "../SemanticError";

export class TypeReference extends Reference implements Type {

    constructor(
        location: SourceLocation,
        public readonly name: string,
        public readonly generics: Type[] = [],
    ) {
        super(location, name);
    }

    get isType(): true { return true; }

    public toKype(): kype.TypeExpression {
        return new kype.TypeExpression(toKypeCheck(new DotExpression(this.location), this));
    }

    getMemberType(property: Identifier | Expression, c: EvaluationContext): Type | null {
        let type: Type | null = null;
        const declaration = c.getDeclaration(this);
        if (isTypeDeclaration(declaration)) {
            type = declaration.value.getMemberType(property, c);
        }
        else if (declaration instanceof StructDeclaration) {
            type = declaration.getMemberType(property, c);
        }

        if (!type && this.name === CoreTypes.Array && !(property instanceof Identifier)) {
            type = this.generics[0];
            // convert type references to type expressions
            if (!type) {
                throw new SemanticError(`Array is missing element type`, this);
            }
        }

        return type;
    }

    getClass(c: EvaluationContext) {
        const declaration = c.getOriginalDeclaration(this);
        return new TypeReference(declaration.location, declaration.id.name);
    }

    toString(user?: boolean) {
        return super.toString(user) + (this.generics.length > 0 ? `<${this.generics.map(g => g.toString(user)).join(",")}>` : ``);
    }    

}
