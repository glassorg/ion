import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { Type } from "./Type";
import { TypeReference } from "./TypeReference";
import { ComparisonExpression } from "./ComparisonExpression";
import { DotExpression } from "./DotExpression";
import { joinExpressions } from "./AstFunctions";
import { CoreTypes } from "../common/CoreType";
import { Identifier } from "./Identifier";
import { EvaluationContext } from "../EvaluationContext";
import { StructDeclaration } from "./StructDeclaration";
import { SemanticError } from "../SemanticError";
import { AstNode } from "./AstNode";
import { MemberExpression } from "./MemberExpression";
import { traverse } from "../common/traverse";
import { replaceDotExpressions } from "../common/utility";
import { BinaryExpression } from "./BinaryExpression";

export function isArrayType(type?: Type) {
    return getArrayElementType(type) !== undefined;
}

export function getArrayElementType(type?: Type): Type | null | undefined {
    if (type instanceof TypeReference) {
        if (type.name === CoreTypes.Array) {
            return type.generics[0] ?? null;
        }
    }
    else if (type instanceof TypeExpression) {
        return getArrayElementType(type.baseType);
    }
}

export class TypeExpression extends Expression implements Type {

    public readonly baseType: TypeReference;

    constructor(
        location: SourceLocation,
        baseType: TypeReference | string,
        public readonly constraints: Expression[] = [],
    ) {
        super(location);
        this.baseType = baseType instanceof TypeReference ? baseType : new TypeReference(location, baseType);
    }

    get isType(): true { return true }

    public toKype() {
        const constraints = [...this.constraints];
        if (this.baseType.name !== CoreTypes.Any) {
            constraints.push(
                new ComparisonExpression(this.baseType.location, new DotExpression(this.baseType.location), "is", this.baseType)
            )
        }
        return new kype.TypeExpression(joinExpressions("&&", constraints).toKype());
    }

    getMemberType(property: Identifier | Expression, c: EvaluationContext): Type {
        const declaration = c.getDeclaration(this.baseType);
        if (!(declaration instanceof StructDeclaration)) {
            throw new SemanticError(`Expected struct or class declaration`, declaration);
        }
        if (!(property instanceof Identifier)) {
            throw new SemanticError(`Expected Identifer`, property);
        }
        const field = declaration.fields.find(field => field.id.name === property.name);
        if (!field) {
            throw new SemanticError(`Property ${property} not found on ${declaration.id.name}`, property);
        }
        return field.type!;
    }

    toString() {
        return `${this.baseType}{${this.constraints}}`;
    }

    public toUserTypeString(): string {
        if (this.constraints.length === 0) {
            return this.baseType.toUserTypeString();
        }
        return `${this.baseType.toUserTypeString()}{${this.constraints.map(c => c.toUserTypeString()).join(",")}}`;
    }

    toFlatExpressionForm(): TypeExpression {
        let constraints = this.constraints.map(e => {
            if (e instanceof ComparisonExpression) {
                if (e.left instanceof MemberExpression && e.operator === "is" && e.left.object instanceof DotExpression && e.right instanceof TypeExpression) {
                    const right = e.right.toFlatExpressionForm();
                    const newConstraints = [
                        new ComparisonExpression(right.baseType.location,
                            e.left, "is", right.baseType),
                        ...right.constraints.map(c => replaceDotExpressions(c, e.left))];
                    return newConstraints;
                }
            }
            return e;
        }).flat();
        return this.patch<TypeExpression>({ constraints })
    }

    toNestedIsForm(): TypeExpression {
        let constraintsByLeftString = new Map<string,BinaryExpression[]>();
        let otherConstraints = new Set<Expression>();
        this.constraints.forEach(e => {
            if (e instanceof BinaryExpression) {
                let {left} = e;
                let leftString = left.toString();
                let leftConstraints = constraintsByLeftString.get(leftString);
                if (!leftConstraints) {
                    constraintsByLeftString.set(leftString, leftConstraints = []);
                }
                leftConstraints.push(e);
            }
            else {
                otherConstraints.add(e);
            }
            return e;
        });
        let joinedConstraints = [...constraintsByLeftString.values()].map(constraints => {
            const left = constraints[0].left;
            const newConstraints: Expression[] = [];
            let baseType: TypeReference | null = null;
            for (let constraint of constraints) {
                if (constraint.operator === "is" && constraint.right instanceof TypeReference) {
                    baseType = constraint.right;
                }
                else {
                    newConstraints.push(constraint.patch({ left: new DotExpression(left.location) }));
                }
            }
            if (baseType) {
                const location = SourceLocation.merge(constraints[0].location, constraints[constraints.length - 1].location);
                return new ComparisonExpression(location, left, "is",
                    new TypeExpression(location, baseType, newConstraints).toNestedIsForm()
                );
            }

            return constraints;
        }).flat();
        // now maybe merge your joinedConstraints.
        // sort joinedConstraints so the longer left values are on the right.
        joinedConstraints.sort((a, b) => a.left.toString().length - b.left.toString().length);
        for (let i = joinedConstraints.length - 1; i >= 0; i--) {
            let a = joinedConstraints[i];
            // now check if you can merge with any other constraints.
            for (let j = i - 1; j >= 0; j--) {
                let b = joinedConstraints[j];
                if (a.left instanceof MemberExpression && a.left.object.toString() === b.left.toString() && b.right instanceof TypeExpression) {
                    // we found a case where the a value could be merged into the b expression.
                    // remove the a from the joinedConstraints
                    joinedConstraints.splice(i, 1);
                    // merge into the b
                    joinedConstraints[j] = b.patch({ right: b.right.patch({ constraints: [
                            ...b.right.constraints,
                            a.patch({
                                left: a.left.patch({ object: new DotExpression(a.left.object.location )})
                            })
                        ]})
                    });
                }
            }
        }
        // now group up the similar constraints
        return this.patch<TypeExpression>({ constraints: [...otherConstraints, ...joinedConstraints ] });
    }

}
