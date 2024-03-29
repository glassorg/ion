import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { isType, toType, Type } from "./Type";
import { TypeReference } from "./TypeReference";
import { ComparisonExpression } from "./ComparisonExpression";
import { DotExpression } from "./DotExpression";
import { joinExpressions } from "./AstFunctions";
import { CoreTypes } from "../common/CoreType";
import { Identifier } from "./Identifier";
import { EvaluationContext } from "../EvaluationContext";
import { MemberExpression } from "./MemberExpression";
import { logOnce, replaceDotExpressions } from "../common/utility";
import { BinaryExpression } from "./BinaryExpression";
import { isSubTypeOf } from "../analysis/isSubType";
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
    else if (type instanceof ConstrainedType) {
        return getArrayElementType(type.baseType);
    }
}

export class ConstrainedType extends Expression implements Type {

    public readonly baseType: Type;

    constructor(
        location: SourceLocation,
        baseType: Type | string,
        public readonly constraints: Expression[] = [],
    ) {
        super(location);
        this.baseType = typeof baseType === "string" ? new TypeReference(location, baseType) : baseType;
        // if (constraints.length === 0) {
        //     logOnce(new Error().stack?.toString());
        // }
    }

    get isType(): true { return true }

    public toKype() {
        const constraints = [...this.toFlatExpressionForm().constraints];
        let type = this.baseType.toKype();
        if (constraints.length > 0) {
            type = kype.joinExpressions([
                new kype.TypeExpression(joinExpressions("&&", constraints).toKype()),
                this.baseType.toKype(),
            ], "&&") as kype.TypeExpression;
        }
        return type;
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
        let checkType = isType(check) ? check : check.type;
        let propertyType = isType(property) ? property : (property.type ?? (property instanceof Literal ? ConstrainedType.fromLiteral(property) : undefined));
        return checkType && propertyType && isSubTypeOf(checkType, propertyType);
    }

    getMemberType(property: Identifier | Expression, c: EvaluationContext): Type | null {
        let type = this.baseType.getMemberType(property, c);
        if (this.constraints.length > 0) {
            let found: ConstrainedType | null = null;
            for (let constraint of this.constraints) {
                if (constraint instanceof ComparisonExpression && (constraint.operator === "is" || constraint.operator === "==") && constraint.left instanceof MemberExpression && constraint.left.object instanceof DotExpression && constraint.right instanceof ConstrainedType) {
                    const constraintProperty = constraint.left.property;
                    // console.log(`doesPropertyMatch Before(${constraintProperty} : ${constraintProperty.type}, ${property} : ${property.type}) => ?`);
                    const isSameProperty = ConstrainedType.doesPropertyMatch(constraintProperty, property);
                    // console.log(`doesPropertyMatch After (${constraintProperty}, ${property}) => ${isSameProperty}`);
                    if (isSameProperty) {
                        found = constraint.operator === "is" ? constraint.right : ConstrainedType.fromLiteral(constraint.right as any);
                        break;
                    }
                }
            }
            if (found) {
                type = type ? joinExpressions("&", [type, found]) : found;
            }
        }
        return type;
    }

    getClass(c: EvaluationContext) {
        return this.baseType.getClass(c);
    }

    toString(user?: boolean) {
        return `${this.baseType.toString(user)}{${this.constraints.map(c => c.toString(user))}}`;
    }

    toFlatExpressionForm(): ConstrainedType {
        let constraints = this.constraints.map(e => {
            if (e instanceof ComparisonExpression) {
                let f: ComparisonExpression = e;
                if (f.operator === "==" && f.right instanceof Literal) {
                    f = f.patch({ operator: "is", right: toType(f.right)});
                }
                if (f.left instanceof MemberExpression && f.operator === "is" && f.left.object instanceof DotExpression && f.right instanceof ConstrainedType) {
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
        return this.patch<ConstrainedType>({ constraints })
    }

    toNestedIsForm(): ConstrainedType {
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
                    new ConstrainedType(location, baseType, newConstraints).toNestedIsForm()
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
                if (a.left instanceof MemberExpression && a.left.object.toString() === b.left.toString() && b.right instanceof ConstrainedType) {
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
        return this.patch<ConstrainedType>({ constraints: [...otherConstraints, ...joinedConstraints ] });
    }

    static fromLiteral<T>(literal: Literal<T>) {
        const { location } = literal;
        return new ConstrainedType(
            location,
            new TypeReference(location, literal.coreType),
            [
                new ComparisonExpression(location, new DotExpression(location), "==", literal)
            ]
        );
    }

}
