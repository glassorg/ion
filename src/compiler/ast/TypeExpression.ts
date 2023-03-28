import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { isType, toType, Type } from "./Type";
import { TypeReference } from "./TypeReference";
import { ComparisonExpression } from "./ComparisonExpression";
import { DotExpression } from "./DotExpression";
import { createBinaryExpression, joinExpressions } from "./AstFunctions";
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
import nodeTest from "node:test";
import { isSubTypeOf } from "../analysis/isSubType";
import { simplify } from "../analysis/simplify";
import { isTypeDeclaration } from "./VariableDeclaration";
import { Literal } from "./Literal";

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
        const constraints = [...this.toFlatExpressionForm().constraints];
        if (this.baseType.name !== CoreTypes.Any) {
            constraints.push(
                new ComparisonExpression(this.baseType.location, new DotExpression(this.baseType.location), "is", this.baseType)
            )
        }
        return new kype.TypeExpression(joinExpressions("&&", constraints).toKype());
    }

    static doesPropertyMatch(property: Identifier | Expression, check: Identifier | Expression) {
        if (property.toString() === check.toString()) {
            return true;
        }
        if (property instanceof Identifier) {
            return check instanceof Identifier && property.name === check.name;
        }
        if (check instanceof Identifier) {
            return false;
        }
        // some keys may not have a type, for instance in Array tyes
        return check.type && property.type && isSubTypeOf(check.type, property.type);
    }

    getMemberType(property: Identifier | Expression, c: EvaluationContext): Type
    getMemberType(property: Identifier | Expression, c: EvaluationContext, throwIfMissing: true): Type
    getMemberType(property: Identifier | Expression, c: EvaluationContext, throwIfMissing: false): Type | null
    getMemberType(property: Identifier | Expression, c: EvaluationContext, throwIfMissing = true): Type | null {
        const declaration = c.getDeclaration(this.baseType);
        if (isTypeDeclaration(declaration) && declaration.value instanceof TypeExpression) {
            return declaration.value.getMemberType(property, c);
        }
        if (!(declaration instanceof StructDeclaration)) {
            if (!throwIfMissing) { return null; }
            throw new SemanticError(`Expected struct or class declaration`, this.baseType);
        }
        let type: Type | undefined;
        if (property instanceof Identifier) {
            const field = declaration.fields.find(field => field.id.name === property.name);
            if (!field) {
                if (!throwIfMissing) { return null; }
                throw new SemanticError(`Property ${property} not found on ${declaration.id.name}`, property);
            }
            type = field.type!;
            // now check constraints.
        }
        // else {
        // }
        if (this.constraints.length > 0) {
            let found: TypeExpression | null = null;
            for (let constraint of this.constraints) {
                if (constraint instanceof ComparisonExpression && constraint.operator === "is" && constraint.left instanceof MemberExpression && constraint.left.object instanceof DotExpression && constraint.right instanceof TypeExpression) {
                    const constraintProperty = constraint.left.property;
                    // console.log(`doesPropertyMatch Before(${constraintProperty} : ${constraintProperty.type}, ${property} : ${property.type}) => ?`);
                    const isSameProperty = TypeExpression.doesPropertyMatch(constraintProperty, property);
                    // console.log(`doesPropertyMatch After (${constraintProperty}, ${property}) => ${isSameProperty}`);
                    if (isSameProperty) {
                        found = constraint.right;
                        break;
                    }
                }
            }
            if (found) {
                type = type ? simplify(joinExpressions("&", [type, found])) : found;
            }
        }
        if (!type && this.baseType.name === CoreTypes.Array) {
            type = toType(this.baseType.generics[0]);
            // convert type references to type expressions
            if (!type) {
                throw new SemanticError(`Array is missing element type`, this.baseType);
            }
        }
        if (!type) {

            if (!throwIfMissing) { return null; }
            throw new SemanticError(`Expected Identifier or Expression`, property);
        }

        return type;
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
                let f: ComparisonExpression = e;
                if (f.operator === "==" && f.right instanceof Literal) {
                    f = f.patch({ operator: "is", right: toType(f.right)});
                    // console.log(`MAYBE FLATTEN : ${e} -> ${foo}`);
                }
                if (f.left instanceof MemberExpression && f.operator === "is" && f.left.object instanceof DotExpression && f.right instanceof TypeExpression) {
                    const right = f.right.toFlatExpressionForm();
                    const newConstraints = [
                        new ComparisonExpression(right.baseType.location,
                            f.left, "is", right.baseType),
                        ...right.constraints.map(c => replaceDotExpressions(c, f.left))];
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
