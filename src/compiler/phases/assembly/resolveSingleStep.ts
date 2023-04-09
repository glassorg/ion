import { Assembly } from "../../ast/Assembly";
import { traverse, traverseWithContext } from "../../common/traverse";
import { AstNS } from "../../ast/AstTypes";
import { EvaluationContext } from "../../EvaluationContext";
import { AstNode } from "../../ast/AstNode";
import { Reference } from "../../ast/Reference";
import { Literal } from "../../ast/Literal";
import { SemanticError } from "../../SemanticError";
import { simplify } from "../../analysis/simplify";
import { ComparisonExpression } from "../../ast/ComparisonExpression";
import { DotExpression } from "../../ast/DotExpression";
import { CoreProperty, CoreTypes } from "../../common/CoreType";
import { SourceLocation } from "../../ast/SourceLocation";
import { LogicalOperator } from "../../Operators";
import { expressionToType, splitFilterJoinMultiple } from "../../common/utility";
import { isSubTypeOf } from "../../analysis/isSubType";
import { Resolvable } from "../../ast/Resolvable";
import { isTypeDeclaration, VariableDeclaration, VariableKind } from "../../ast/VariableDeclaration";
import { FunctionType } from "../../ast/FunctionType";
import { MultiFunctionType } from "../../ast/MultiFunctionType";
import { MultiFunction } from "../../ast/MultiFunction";
import { ForStatement } from "../../ast/ForStatement";
import { toType } from "../../ast/Type";
import { TypeReference } from "../../ast/TypeReference";
import { Type } from "../../ast/Type";
import { Expression } from "../../ast/Expression";
import { getArrayElementType, isArrayType, ConstrainedType } from "../../ast/ConstrainedType";
import { joinExpressions, splitExpressions } from "../../ast/AstFunctions";
import { StructDeclaration } from "../../ast/StructDeclaration";
import { Identifier } from "../../ast/Identifier";
import { MemberExpression } from "../../ast/MemberExpression";
import { IntegerLiteral } from "../../ast/IntegerLiteral";
import { TypeofExpression } from "../../ast/TypeOfExpression";
import { ArgPlaceholder } from "../../ast/ArgPlaceholder";
import { FunctionExpression } from "../../ast/FunctionExpression";

function resolveAll<T extends AstNode>(node: T): T {
    return traverse(node, {
        leave(node) {
            if (node instanceof TypeofExpression) {
                throw new Error("Cannot resolveAll on TypeofExpression");
            }
            if (node instanceof Resolvable && !node.resolved) {
                return node.patch({ resolved: true });
            }
        }
    })
}

function BooleanType(location: SourceLocation) {
    return resolveAll(toType(new TypeReference(location, CoreTypes.Boolean)));
}

function LiteralType(node: Literal<any>) {
    return resolveAll(toType(node));
}

type ResolveFunction<T extends (new (...args: any) => AstNode)> = (node: InstanceType<T>, c: EvaluationContext) => AstNode | void

function isTypeReference(type: Type | undefined, name: string): type is TypeReference {
    return type instanceof TypeReference && type.name === name;
}

const maybeResolveNode: {
    [Key in keyof AstNS]?: AstNS[Key] extends (new (...args: any[]) => AstNode) ? ResolveFunction<AstNS[Key]> : never
} = {
    BlockStatement(node, c) {
        if (node.statements.every(s => s.resolved)) {
            return node.patch({ resolved: true });
        }
    },
    TypeofExpression(node, c) {
        const argType = node.argument.type;
        if (argType) {
            // convert this to the underlying typeof value.
            switch (node.operator) {
                case "typeof":
                    return argType;
                case "classof":
                    if (!(argType instanceof ConstrainedType)) {
                        throw new SemanticError(`Expected constrained type`, argType);
                    }
                    return argType.baseType;
            }
        }
        else if (node.argument instanceof ArgPlaceholder && node.operator === "classof") {
            // if we only want the class of an argument, we should be able to find that.
            let parentFunc = c.lookup.findAncestor(node, FunctionExpression)!;
            let argType = parentFunc.parameters[node.argument.index].type;
            if (argType?.resolved) {
                let classType = argType.getClass(c);
                return classType;
            }
        }
    },
    UnaryExpression(node, c) {
        if (!node.argument.type) {
            return;
        }
        //  are we sure that's right? I don't think it is
        //  Unary ! stays boolean
        //  Unary - should change the sign of the resolved type...
        return node.patch({ type: node.argument.type, resolved: true });
    },
    RangeExpression(node, c) {
        if (node.start.resolved && node.finish.resolved) {
            //  for now, type range expressions as equivalent to arrays.
            const constraints: Expression[] = [
            ];
            if (!isTypeReference(node.start.type, CoreTypes.Integer)) {
                constraints.push(new ComparisonExpression(node.start.location, new DotExpression(node.start.location), ">=", node.start.type!));
            }
            if (!isTypeReference(node.finish.type, CoreTypes.Integer)) {
                constraints.push(new ComparisonExpression(node.finish.location, new DotExpression(node.finish.location), "<", node.finish.type!));
            }
            const elementType = new ConstrainedType(
                node.location,
                CoreTypes.Integer,
                constraints
            )
            const before = new TypeReference(node.location, CoreTypes.Array, [elementType])
            // could add length constraint here.
            const type = resolveAll(before);
            return node.patch({ type, resolved: true });
        }
    },
    ReturnStatement(node, c) {
        if (node.argument.resolved && node.argument.type) {
            return node.patch({ type: node.argument.type, resolved: true });
        }
    },
    CompositeType(node, c) {
        if (node.left.resolved && node.right.resolved) {
            return resolveAll(simplify(node));
        }
    },
    DotExpression(node, c) {
        // get parent dot expression.
        const parentTypeExpression = c.lookup.findAncestor(node, ConstrainedType);
        if (!parentTypeExpression) {
            throw new SemanticError(`Dot expression only valid within a TypeExpression`, node);
        }
        if (!parentTypeExpression.baseType.resolved) {
            return;
        }

        const type = resolveAll(parentTypeExpression.baseType);
        return node.patch({ type, resolved: true });
    },
    ConstrainedType(node, c) {
        if (node.constraints.length === 0) {
            // remove constrained type if there are no contraints.
            return node.baseType;
        }
        if (node.baseType.resolved) {
            const constraintsResolved = node.constraints.every(constraint => constraint.resolved);
            if (constraintsResolved) {
                // if this is nested ConstrainedTypes then we merge their constraints into one.
                if (node.baseType instanceof ConstrainedType) {
                    return resolveAll(simplify(node.baseType.patch({ constraints: [...node.baseType.constraints, ...node.constraints]})))
                }
                return resolveAll(node);
            }
        }
    },
    VariableDeclaration(node, c) {
        if (node.kind === VariableKind.For) {
            const parent = c.lookup.findAncestor(node, ForStatement)!;
            if (parent.right.resolved) {
                const rightType = parent.right.type;
                if (!isArrayType(rightType)) {
                    throw new SemanticError(`Expected Array type: ${parent.right}`, parent.right);
                }
                const elementType = getArrayElementType(rightType);
                if (!elementType) {
                    throw new SemanticError(`Expected Array element type: ${parent.right}`);
                }
                return node.patch({ type: elementType, resolved: true });
            }
        }
        else {
            if ((node.type == null || node.type.resolved) &&
                (node.declaredType == null || node.declaredType.resolved) &&
                (node.value == null || node.value.resolved)
            ) {
                if (node.value?.type && node.declaredType) {
                    const isSubType = isSubTypeOf(node.value.type, node.declaredType);
                    if (!isSubType) {
                        throw new SemanticError(`Variable value type ${node.value.type.toUserString()} ${isSubType === false ? "can" : "may"} not satisfy declared variable type ${node.declaredType.toUserString()}`, node.declaredType, node.value);
                    }
                }
                let type = node.type ?? node.value?.type ?? node.declaredType;
                if (type) {
                    type = resolveAll(simplify(type));
                    return node.patch({ type, resolved: true });
                }
    
            }
        }
    },
    ConditionalAssertion(node, c) {
        const test = node.getKnownTrueExpression(c);
        if (!test.resolved) {
            return;
        }

        const splitOps: LogicalOperator[] = ["||", "&&"];
        let joinOps = splitOps.slice(0);
        if (node.negate) {
            joinOps.reverse();
        }
        let knownType = node.value.type!;
        // if (!(knownType instanceof ConstrainedType)) {
        //     console.log(knownType);
        //     throw new SemanticError(`We don't know how to handle this yet`, node.value);
        // }
        const assertedDotConstraints = splitFilterJoinMultiple(test, splitOps, joinOps, e => expressionToType(e, node.value, node.negate));
        const assertedOptions = splitExpressions("||", assertedDotConstraints);
        let newTypes = assertedOptions.map(assertedOption => {
            return splitExpressions("|", knownType).map(knownTypeOption => {
                if (knownTypeOption instanceof TypeReference) {
                    knownTypeOption = new ConstrainedType(knownTypeOption.location, knownTypeOption);
                }
                if (!(knownTypeOption instanceof ConstrainedType)) {
                    throw new SemanticError(`We expected a type constraint here ` + knownTypeOption);
                }
                return knownTypeOption.patch({
                    constraints: [...knownTypeOption.constraints, ...splitExpressions("&&", assertedOption)]
                });
            })
        }).flat();
        let newType = simplify(joinExpressions("|", newTypes));
        const isAssertedConsequent = isSubTypeOf(knownType, newType);
        if (isAssertedConsequent === false) {
            throw new SemanticError(`If test will always fail`, test);
        }
        if (isAssertedConsequent === true) {
            throw new SemanticError(`If test will always pass`, test);
        }
        // if this conditional lets us assert a more specific type then we add it.
        return node.patch({ type: newType, resolved: true });
    },
    StructDeclaration(node, c) {
        return this.ClassDeclaration!(node, c);
    },
    ClassDeclaration(node, c) {
        if (!node.fields.every(child => child.resolved)) {
            return;
        }
        // convert to a TypeExpression.
        const type = resolveAll(new TypeReference(node.id.location, node.absolutePath!));
        return node.patch({ type, resolved: true });
    },
    CallExpression(node, c) {
        if (!(node.callee instanceof Reference)) {
            throw new SemanticError(`Only multifunction references currently supported`, node.callee);
        }
        const callee = c.getDeclaration(node.callee);

        // functions need to be resolved into inferred types or something.
        if (!(node.args.every(arg => arg.type?.resolved))) {
            return;
        }

        let type: Type | null;
        if (callee instanceof StructDeclaration) {
            type = new TypeReference(node.location, callee.absolutePath!);
        }
        else if (callee instanceof VariableDeclaration && callee.value instanceof MultiFunction) {
            const multiFunc = callee.value;
            if (!multiFunc.sorted) {
                // if the multiFunction is sorted then we can know which functions we *might* actually call
                return;
            } 
            // boom, we have the correctly resolved types.
            type = multiFunc.getReturnType(node.args, c, node);
        }
        else {
            throw new SemanticError(`Invalid callee: ${callee}`, callee);
        }

        if (type) {
            return node.patch({ type: resolveAll(type), resolved: true });
        }
    },
    ComparisonExpression(node, c) {
        let type = node.type || BooleanType(node.location);
        let resolved = node.left.resolved && node.right.resolved;
        if (type !== node.type || resolved !== node.resolved) {
            return node.patch({ type, resolved });
        }
    },
    LogicalExpression(node, c) {
        let type = node.type || BooleanType(node.location);
        let resolved = node.left.resolved && node.right.resolved;
        if (type !== node.type || resolved !== node.resolved) {
            return node.patch({ type, resolved });
        }
    },
    FloatLiteral(node, c) {
        return node.patch({ type: LiteralType(node), resolved: true });
    },
    StringLiteral(node, c) {
        return node.patch({ type: LiteralType(node), resolved: true });
    },
    IntegerLiteral(node, c) {
        return node.patch({ type: LiteralType(node), resolved: true });
    },
    ArrayExpression(node, c) {
        if (node.elements.every(element => element.resolved)) {
            const elementType = simplify(joinExpressions("|", node.elements.map(e => e.type!)));
            const type = new ConstrainedType(
                node.location,
                new TypeReference(
                    node.location,
                    CoreTypes.Array,
                    [elementType]
                ),
                [
                    // new length constraint
                    new ComparisonExpression(
                        node.location,
                        new MemberExpression(node.location,
                            new DotExpression(node.location),
                            new Identifier(node.location, CoreProperty.length)
                        ),
                        "is",
                        toType(new IntegerLiteral(node.location, node.elements.length))
                    ),
                    ...node.elements.map((e, i) => {
                        return new ComparisonExpression(
                            node.location,
                            new MemberExpression(node.location,
                                new DotExpression(node.location),
                                new IntegerLiteral(node.location, i)
                            ),
                            "is",
                            e.type!
                        );
                    })
                ]
            );
            return node.patch({ type: resolveAll(type), resolved: true });
        }
    },
    DeferredReference(node, c) {
        const parentTypeExpression = c.lookup.findAncestor(node, ConstrainedType)!;
        if (parentTypeExpression.baseType.resolved) {
            const memberType = parentTypeExpression.getMemberType(node.id, c);
            if (memberType) {
                // convert this deferred reference into a dot member reference.
                return new MemberExpression(node.location, new DotExpression(node.location), node.id);
            }
            else {
                const ref = new Reference(node.location, node.id.name);
                // try to get the declaration, will throw if not found.
                c.getDeclaration(ref);
                return ref;
            }
        }
    },
    TypeReference(node, c) {
        // check any generic parameters on the reference.
        if (!node.generics.every(ref => ref.resolved)) {
            return;
        }

        const declaration = c.getDeclaration(node);
        if (declaration.resolved && isTypeDeclaration(declaration)) {
            if (node.generics.length > 0) {
                throw new SemanticError(`Not sure what to do with generics here`, node);
            }
            return declaration.value;
        }

        return this.Reference!(node, c);
    },
    Reference(node, c) {
        const declaration = c.getDeclaration(node);
        if (!declaration.resolved) {
            return;
        }

        const { type } = declaration
        if (declaration instanceof VariableDeclaration && declaration.isConstant) {
            const value = declaration.value!;
            if (value instanceof Literal || value instanceof Reference) {
                return value.patch({ type, resolved: true, location: node.location });
            }
        }
        return node.patch({ type, resolved: true });
    },
    ArgPlaceholder(node, c) {
        const parentFunction = c.lookup.findAncestor(node, FunctionExpression);
        const param = parentFunction?.parameters[node.index];
        if (param?.resolved) {
            return node.patch({ type: param.type, resolved: true });
        }
    },
    MemberExpression(node, c) {
        if (!node.object.resolved || (!node.isPropertyResolved)) {
            return;
        }
        if (node.type?.resolved) {
            return node.patch({ resolved: true });
        }
        const objectType = node.object.type!;
        const propertyType = objectType.getMemberType(node.property, c);
        if (!propertyType) {
            throw new SemanticError(`Property ${node.property} not found on ${objectType.toUserString()}`, node.property);
        }
        return node.patch({ type: propertyType });
    },
    MultiFunction(node, c) {
        // check if every nodes parameters are resolved?
        if (!node.sorted && node.functions.every(func =>
            (c.getConstantValue(func) as FunctionExpression).areParameterTypesAllResolved())
        ) {
            node = node.toSorted(c);
        }
        if (node.sorted && !node.type && node.functions.every(func => func.type)) {
            const type = new MultiFunctionType(node.location, node.functions.map(func => func.type as FunctionType));
            node = node.patch({ type });
        }
        if (node.type?.resolved) {
            node = node.patch({ resolved: true });
        }
        return node;
    },
    FunctionType(node, c) {
        if (node.returnType.resolved && node.parameterTypes.every(type => type.resolved)) {
            return node.patch({ resolved: true });
        }
    },
    MultiFunctionType(node, c) {
        if (node.functionTypes.every(funcType => funcType.resolved)) {
            return node.patch({ resolved: true });
        }
    },
    FunctionExpression(node, c) {
        if (!node.type && node.returnType?.resolved && node.parameters.every(p => p.type?.resolved)) {
            const type = new FunctionType(node.location, node.parameters.map(p => p.type!), node.returnType);
            node = node.patch({ type /* do not resolve entire function expression */ });
        }

        //  return statements resolved?
        const returnStatements = node.getReturnStatements();
        if (returnStatements.every(statement => statement.argument.type?.resolved)) {
            if (node.returnType) {
                for (let statement of returnStatements) {
                    const returnType = statement.argument.type!;
                    const isSubType = isSubTypeOf(returnType, node.returnType);
                    if (isSubType !== true) {
                        throw new SemanticError(`Return type ${returnType.toUserString()} ${isSubType === false ? "can" : "may"} not satisfy declared return type ${node.returnType.toUserString()}`, node.returnType, statement);
                    }
                }
            }

            //  check each return statements type 
            //  resolve!
            const resolvedReturnType = resolveAll(simplify(joinExpressions("|", returnStatements.map(s => s.argument.type!))));
            if (node.returnTypeExact && node.returnType) {
                // user has requested an exact return type check
                const expectedReturnType = simplify(node.returnType);
                if (expectedReturnType.toString() !== resolvedReturnType.toString()) {
                    throw new SemanticError(`Return type (${expectedReturnType.toUserString()}) declared as exact with :: did not match resolved type (${resolvedReturnType.toUserString()})`, node.returnType);
                }
            }

            node = node.patch({ returnType: resolvedReturnType });
        }
        if (node.type?.resolved && node.returnType?.resolved && node.body?.resolved) {
            node = node.patch({ resolved: true });
        }
        return node;
    }
};

export const repeatSuffix = "_N";
export function resolveSingleStep_N(root: Assembly): Assembly {
    return traverseWithContext(root, c => {
        return ({
            leave(node) {
                if (node instanceof Resolvable && !node.resolved) {
                    node = (maybeResolveNode as any)[node.constructor.name]?.(node, c) ?? node;
                }
                return node;
            }
        });
    })
}