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
import { CoreTypes } from "../../common/CoreType";
import { SourceLocation } from "../../ast/SourceLocation";
import { LogicalOperator } from "../../Operators";
import { expressionToType, splitFilterJoinMultiple } from "../../common/utility";
import { isSubTypeOf } from "../../analysis/isSubType";
import { Resolvable } from "../../ast/Resolvable";
import { isTypeDeclaration, VariableDeclaration } from "../../ast/VariableDeclaration";
import { FunctionType } from "../../ast/FunctionType";
import { MultiFunctionType } from "../../ast/MultiFunctionType";
import { MultiFunction } from "../../ast/MultiFunction";
import { ForStatement } from "../../ast/ForStatement";
import { toType } from "../../ast/Type";
import { TypeReference } from "../../ast/TypeReference";
import { Type } from "../../ast/Type";
import { Expression } from "../../ast/Expression";
import { getArrayElementType, isArrayType, TypeExpression } from "../../ast/TypeExpression";
import { joinExpressions, splitExpressions } from "../../ast/AstFunctions";
import { StructDeclaration } from "../../ast/StructDeclaration";
import { Identifier } from "../../ast/Identifier";

function resolveAll<T extends AstNode>(node: T): T {
    return traverse(node, {
        leave(node) {
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
        if (node.argument.type) {
            // convert this to the underlying typeof value.
            return node.argument.type!
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
            const elementType = new TypeExpression(
                node.location,
                CoreTypes.Integer,
                constraints
            )
            const before = new TypeExpression(
                node.location,
                new TypeReference(node.location, CoreTypes.Array, [elementType])
                // could add length constraint here.
            );
            const type = resolveAll(before);
            return node.patch({ type, resolved: true });
        }
    },
    ForVariantDeclaration(node, c) {
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
    },
    ReturnStatement(node, c) {
        if (node.type?.resolved) {
            return node.patch({ resolved: true });
        }
    },
    CompositeType(node, c) {
        if (node.left.resolved && node.right.resolved) {
            return resolveAll(simplify(node));
        }
    },
    DotExpression(node, c) {
        // get parent dot expression.
        const parentTypeExpression = c.lookup.findAncestor(node, TypeExpression);
        if (!parentTypeExpression) {
            throw new SemanticError(`Dot expression only valid within a TypeExpression`, node);
        }
        if (!parentTypeExpression.baseType.resolved) {
            return;
        }

        const type = resolveAll(new TypeExpression(parentTypeExpression.baseType.location, parentTypeExpression.baseType.name));
        return node.patch({ type, resolved: true });
    },
    TypeExpression(node, c) {
        if (node.baseType.resolved) {
            const declaration = c.getOriginalDeclaration(node.baseType);
            if (isTypeDeclaration(declaration)) {
                // This needs to combine the current constraints to the base declaration.
                if (declaration.value instanceof TypeExpression) {
                    if (node.constraints.length > 0) {
                        let constraints =  [...node.constraints, ...declaration.value.constraints];
                        let baseType = declaration.value.baseType;
                        return simplify(node.patch({ baseType, constraints }));
                        // throw new SemanticError(`WE NEED TO IMPLEMENT TYPE COMBINING`, node);
                    }
                    return declaration.value;
                }
            }
            const constraintsResolved = node.constraints.every(constraint => constraint.resolved);
            if (constraintsResolved) {
                return resolveAll(node);
            }
        }
    },
    VariableDeclaration(node, c) {
        if ((node.type == null || node.type.resolved) &&
            (node.declaredType == null || node.declaredType.resolved) &&
            (node.value == null || node.value?.type?.resolved)
        ) {
            if (node.value?.type && node.declaredType) {
                const isSubType = isSubTypeOf(node.value.type, node.declaredType);
                if (!isSubType) {
                    throw new SemanticError(`Variable value type ${node.value.type.toUserTypeString()} ${isSubType === false ? "can" : "may"} not satisfy declared variable type ${node.declaredType.toUserTypeString()}`, node.declaredType, node.value);
                }
            }
            // ensure type is simplified
            let beforeType = node.type ?? node.value?.type ?? node.declaredType!;
            let type = simplify(beforeType);
            return node.patch({ type, resolved: true });
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
        if (!(knownType instanceof TypeExpression)) {
            throw new SemanticError(`We don't know how to handle this yet`, node.value);
        }
        const assertedDotConstraints = splitFilterJoinMultiple(test, splitOps, joinOps, e => expressionToType(e, node.value, node.negate));
        const assertedOptions = splitExpressions("||", assertedDotConstraints);
        let newTypes = assertedOptions.map(assertedOption => {
            return splitExpressions("|", knownType).map(knownTypeOption => {
                if (!(knownTypeOption instanceof TypeExpression)) {
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
        const type = resolveAll(new TypeExpression(node.id.location, node.absolutePath!));
        return node.patch({ type, resolved: true });
    },
    CallExpression(node, c) {
        if (!(node.callee instanceof Reference)) {
            throw new SemanticError(`Only multifunction references currently supported`, node.callee);
        }
        const callee = c.getDeclaration(node.callee);

        // functions need to be resolved into inferred types or something.
        if (!callee.resolved || !(node.args.every(arg => arg.type?.resolved))) {
            return;
        }

        let type: Type;
        if (callee instanceof StructDeclaration) {
            type = new TypeExpression(node.location, callee.absolutePath!);
        }
        else if (callee instanceof VariableDeclaration && callee.value instanceof MultiFunction) {
            const multiFunc = callee.value;
            // boom, we have the correctly resolved types.
            const argTypes = node.args.map(arg => arg.type!);
            type = multiFunc.getReturnType(argTypes, c, node);
        }
        else {
            throw new SemanticError(`Invalid callee: ${callee}`, callee);
        }
        return node.patch({ type, resolved: true });
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
    TypeReference(node, c) {
        // check any generic parameters on the reference.
        if (!node.generics.every(ref => ref.resolved)) {
            return;
        }
        return this.Reference!(node, c);
    },
    Reference(node, c) {
        const declaration = c.getDeclaration(node);
        if (!declaration.type?.resolved) {
            return;
        }

        const { type } = declaration
        if (declaration instanceof VariableDeclaration && declaration.isConstant) {
            const value = declaration.value!;
            if (value instanceof Literal || value instanceof Reference) {
                return value.patch({ type, resolved: true });
            }
        }
        return node.patch({ type, resolved: true });
    },
    MemberExpression(node, c) {
        if (!node.object.resolved || (!node.isPropertyResolved)) {
            return;
        }
        const objectType = node.object.type!;
        if (!(objectType instanceof TypeExpression)) {
            throw new SemanticError(`Expected TypeExpression`, objectType)
        }
        const propertyType = objectType.getMemberType(node.property, c);
        return node.patch({ resolved: true, type: resolveAll(propertyType) });
    },
    MultiFunction(node, c) {
        // check if every is resolved?
        if (!node.type && node.functions.every(func => func.type)) {
            // sort the multi function
            node = node.toSorted(c);
            const type = new MultiFunctionType(node.location, node.functions.map(func => func.type as FunctionType));
            node = node.patch({ type });
        }

        if (node.type?.resolved) {
            node = node.patch({ resolved: true });
        }

        return node;
    },
    MultiFunctionType(node, c) {
        if (node.functionTypes.every(funcType => funcType.resolved)) {
            return node.patch({ resolved: true });
        }
    },
    FunctionExpression(node, c) {
        if (!node.type && node.returnType?.resolved && node.parameters.every(p => p.type?.resolved)) {
            const type = resolveAll(new FunctionType(node.location, node.parameters.map(p => p.type!), node.returnType));
            node = node.patch({ type /* do not resolve entire function expression */ });
        }

        //  return statements resolved?
        const returnStatements = node.getReturnStatements();
        if (returnStatements.length === 0) {
            debugger;
            node.getReturnStatements();
        }
        if (returnStatements.every(statement => statement.argument.type)) {
            if (node.returnType) {
                for (let statement of returnStatements) {
                    const returnType = statement.argument.type!;
                    const isSubType = isSubTypeOf(returnType, node.returnType);
                    if (isSubType !== true) {
                        throw new SemanticError(`Return type ${returnType.toUserTypeString()} ${isSubType === false ? "can" : "may"} not satisfy declared return type ${node.returnType.toUserTypeString()}`, node.returnType, statement);
                    }
                }
            }

            //  check each return statements type 
            //  resolve!
            const resolvedReturnType = simplify(joinExpressions("|", returnStatements.map(s => s.argument.type!)));
            if (node.returnTypeExact && node.returnType) {
                // user has requested an exact return type check
                const expectedReturnType = simplify(node.returnType);
                if (expectedReturnType.toString() !== resolvedReturnType.toString()) {
                    throw new SemanticError(`Return type (${expectedReturnType.toUserTypeString()}) declared as exact with :: did not match resolved type (${resolvedReturnType.toUserTypeString()})`, node.returnType);
                }
            }

            node = node.patch({ resolved: true, returnType: resolvedReturnType });
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