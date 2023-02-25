import { Assembly } from "../../ast/Assembly";
import { traverse, traverseWithContext } from "../../common/traverse";
import { AstNS } from "../../ast/AstTypes";
import { EvaluationContext } from "../../EvaluationContext";
import { AstNode } from "../../ast/AstNode";
import { Reference } from "../../ast/Reference";
import { Literal } from "../../ast/Literal";
import { SemanticError } from "../../SemanticError";
import { combineTypes, simplifyType } from "../../analysis/combineTypes";
import { ComparisonExpression } from "../../ast/ComparisonExpression";
import { DotExpression } from "../../ast/DotExpression";
import { CoreTypes } from "../../common/CoreType";
import { SourceLocation } from "../../ast/SourceLocation";
import { joinExpressions } from "../../ast/AstFunctions";
import { LogicalOperator } from "../../Operators";
import { expressionToType, splitFilterJoinMultiple } from "../../common/utility";
import { CallExpression } from "../../ast/CallExpression";
import { isSubTypeOf } from "../../analysis/isSubType";
import { Resolvable } from "../../ast/Resolvable";
import { VariableDeclaration } from "../../ast/VariableDeclaration";
import { FunctionType } from "../../ast/FunctionType";
import { MultiFunctionType } from "../../ast/MultiFunctionType";
import { MultiFunction } from "../../ast/MultiFunction";
import { AssignmentExpression } from "../../ast/AssignmentExpression";
import { getTypeAssertion } from "../../common/utility";
import { ForStatement } from "../../ast/ForStatement";

function resolveAll(node: AstNode) {
    return traverse(node, {
        leave(node) {
            if (node instanceof Resolvable && !node.resolved) {
                return node.patch({ resolved: true });
            }
        }
    })
}

function BooleanType(location: SourceLocation) {
    return resolveAll(new ComparisonExpression(location,
        new DotExpression(location),
        "is",
        new Reference(location, CoreTypes.Boolean)
    ));
}

function LiteralType(node: Literal<any>) {
    return resolveAll(joinExpressions("&&", [
        new ComparisonExpression(
            node.location,
            new DotExpression(node.location),
            "==",
            node
        ),
        new ComparisonExpression(
            node.location,
            new DotExpression(node.location),
            "is",
            new Reference(node.location, node.coreType)
        ),
    ]));
}

type ResolveFunction<T extends (new (...args: any) => AstNode)> = (node: InstanceType<T>, c: EvaluationContext) => AstNode | void

const maybeResolveNode: {
    [Key in keyof AstNS]?: AstNS[Key] extends (new (...args: any[]) => AstNode) ? ResolveFunction<AstNS[Key]> : never
} = {
    BlockStatement(node, c) {
        if (node.statements.every(s => s.resolved)) {
            return node.patch({ resolved: true });
        }
    },
    UnaryExpression(node, c) {
        if (node.operator === "typeof") {
            if (node.argument.type) {
                // convert this to the underlying typeof value.
                return node.argument.type!
            }
            return;
        }
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
            // we need array type!
            // what's the type of a RangeExpression?
            console.log("we need array type " + node);
        }
    },
    ForVariantDeclaration(node, c) {
        const parent = c.lookup.findAncestor(node, ForStatement)!;
        if (parent.right.resolved) {
            console.log(" ------> " + node + " right: " + parent.right);
        }
    },
    TypeDeclaration(node, c) {
        if (node.type.resolved) {
            return node.patch({ type: resolveAll(simplifyType(node.type)), resolved: true });
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
            let type = simplifyType(node.type ?? node.value?.type ?? node.declaredType!);

            return node.patch({ type, resolved: true });
        }

    },
    ConditionalAssertion(node, c) {
        // console.log("MAYBE: " + node);
        if (!node.value.resolved && node.value.toString() === "`a:16:0`") {
            console.log("!node.value.resolved: " + node.value);
            return;
        }
        const test = node.getKnownTrueExpression(c);
        if (!test.resolved) {
            return;
        }
        const splitOps: LogicalOperator[] = ["||", "&&"];
        let joinOps = splitOps.slice(0);
        if (node.negate) {
            joinOps.reverse();
        }
        let type = node.value.type!;
        let assertedType = splitFilterJoinMultiple(test, splitOps, joinOps, e => expressionToType(e, node.value, node.negate));
        if (assertedType) {
            if (assertedType instanceof CallExpression) {
                splitFilterJoinMultiple(test, splitOps, joinOps, e => expressionToType(e, node.value, node.negate));
            }
            const isAssertedConsequent = isSubTypeOf(type, assertedType);
            if (isAssertedConsequent === false) {
                throw new SemanticError(`If test will always evaluate to false`, test);
            }
            if (isAssertedConsequent === true) {
                throw new SemanticError(`If test will always evaluate to true`, test);
            }
            // if this conditional lets us assert a more specific type then we add it.
            type = combineTypes("&&", [type, assertedType]);
        }
        return node.patch({ type: type, resolved: true });
    },
    ClassDeclaration(node, c) {
        if (!node.fields.every(child => child.resolved)) {
            return;
        }
        // TODO: Add Instance Types for Class Declarations...
        const type = resolveAll(getTypeAssertion(node.absolutePath!, node.location));
        return node.patch({ type, resolved: true });
    },
    CallExpression(node, c) {
        // functions need to be resolved into inferred types or something.
        const calleeType = node.callee.type;
        if (!calleeType?.resolved || !(node.args.every(arg => arg.type?.resolved))) {
            return;
        }

        if (!(node.callee instanceof Reference)) {
            throw new SemanticError(`Only multifunction references currently supported`, node.callee);
        }

        const callee = c.getDeclaration(node.callee);
        if (!(callee instanceof VariableDeclaration) || !(callee.value instanceof MultiFunction)) {
            throw new SemanticError(`Invalid callee`, node.callee);
        }
        const multiFunc = callee.value;

        // boom, we have the correctly resolved types.
        const argTypes = node.args.map(arg => arg.type!);

        const type = multiFunc.getReturnType(argTypes, c, node);
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
    Reference(node, c) {
        const declaration = c.getDeclaration(node);
        if (!declaration.resolved) {
            return;
        }
        // check any generic parameters on the reference.
        if (!node.generics.every(ref => ref.resolved)) {
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
    MultiFunction(node, c) {
        // check if every is resolved?
        if (!node.type && node.functions.every(func => func.type)) {
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
        const returnStatements = [...node.getReturnStatements()];
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
            const resolvedReturnType = combineTypes("||", returnStatements.map(s => s.argument.type!));
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
                if (node instanceof AssignmentExpression) {
                    console.log(node.toString(), {
                        resolvable: node instanceof Resolvable,
                        resolved: node.resolved
                    })
                }
                if (node instanceof Resolvable && !node.resolved) {
                    node = (maybeResolveNode as any)[node.constructor.name]?.(node, c) ?? node;
                }
                return node;
            }
        });
    })
}