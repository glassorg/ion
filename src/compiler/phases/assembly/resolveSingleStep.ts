import { Assembly } from "../../ast/Assembly";
import { Expression } from "../../ast/Expression";
import { traverse, traverseWithContext } from "../../common/traverse";
import { AstNS } from "../../ast/AstTypes";
import { EvaluationContext } from "../../EvaluationContext";
import { AstNode } from "../../ast/AstNode";
import { Reference } from "../../ast/Reference";
import { ConstantDeclaration } from "../../ast/ConstantDeclaration";
import { Literal } from "../../ast/Literal";
import { SemanticError } from "../../SemanticError";
import { combineTypes } from "../../analysis/combineTypes";
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
import { VariableDeclaration, VariableKind } from "../../ast/VariableDeclaration";
import { FunctionType } from "../../ast/FunctionType";

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
            "is",
            new Reference(node.location, node.coreType)
        ),
        new ComparisonExpression(
            node.location,
            new DotExpression(node.location),
            "==",
            node
        ),
    ]));
}

type ResolveFunction<T extends (new (...args: any) => AstNode)> = (node: InstanceType<T>, c: EvaluationContext) => AstNode | void

const maybeResolveNode: {
    [Key in keyof AstNS]?: AstNS[Key] extends (new (...args: any[]) => AstNode) ? ResolveFunction<AstNS[Key]> : never
} = {
    // AssignmentExpression(node, c) {
    //     if (!node.right.type) {
    //         return;
    //     }
    //     return node.patch({ type: node.right.type });
    // },
    UnaryExpression(node, c) {
        if (node.operator === "typeof") {
            if (node.argument.type) {
                // convert this to the underlying typeof value.
                return node.argument.type!
            }
        }
        if (!node.argument.type) {
            return;
        }
        //  are we sure that's right? I don't think it is
        //  Unary ! stays boolean
        //  Unary - should change the sign of the resolved type...
        return node.patch({ type: node.argument.type, resolved: true });
    },
    VariableDeclaration(node, c) {
        if (node.kind === VariableKind.Constant) {
            //  we actually don't care if the node value is completely resolved
            //  so long as it's type is resolved.
            //  this is true when the value is a function expression.
            //  the function may not be fully resolved, but as long as the signature is
            //  resolved then we know the variables type.
            if (node.value?.type?.resolved) {
                return node.patch({ type: node.value.type, resolved: true });
            }
        }
        else if (node.type?.resolved) {
            return node.patch({ type: node.type, resolved: true });
        }
    },
    ConditionalAssertion(node, c) {
        // console.log("MAYBE: ", node.value);
        if (!node.value.resolved) {
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
    CallExpression(node, c) {
        // functions need to be resolved into inferred types or something.
        if (!node.callee.resolved || !(node.args.every(arg => arg.resolved))) {
            return
        }

        console.log(node.toString());

        // // boom, we have the correctly resolved types.
        // const argTypes = node.args.map(arg => c.getType(arg));
        // let functionTypes = c.getFunctionTypes(node.callee, argTypes);
        // if (Array.isArray(functionTypes)) {
        //     functionTypes = functionTypes.filter(type => type.value.areArgumentsValid(argTypes) !== false);
        //     if (functionTypes.length === 0) {
        //         throw new SemanticError(`${node.callee} Function with these parameters not found`, node);
        //     }
        //     const returnTypes = functionTypes.map(declaration => declaration.getReturnType(argTypes, node)).filter(Boolean) as Expression[];
        //     const type = combineTypes("||", returnTypes);
        //     return type;
        // }
        // else {
        //     throw new Error("Not handled yet");
        // }
    },
    ComparisonExpression(node, c) {
        return node.patch({ type: BooleanType(node.location), resolved: true });
    },
    LogicalExpression(node, c) {
        return node.patch({ type: BooleanType(node.location), resolved: true });
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

        const { type } = declaration
        if (declaration instanceof VariableDeclaration && declaration.kind === VariableKind.Constant) {
            const value = declaration.value!;
            if (value instanceof Literal || value instanceof Reference) {
                return value.patch({ type, resolved: true });
            }
        }
        return node.patch({ type, resolved: true });
    },
    FunctionExpression(node, c) {
        if (!node.type && node.returnType?.resolved && node.parameters.every(p => p.type?.resolved)) {
            const type = resolveAll(new FunctionType(node.location, node.parameters.map(p => p.type!), node.returnType));
            return node.patch({ type /* do not resolve entire function expression */ });
        }
        // //  node resolved?
        // if (node.returnType && node.type) {
        //     return;
        // }
        // //  dependencies resolved?
        // const returnStatements = [...node.getReturnStatements()];
        // for (const statement of returnStatements) {
        //     if (!statement.argument.type) {
        //         return;
        //     }
        // }
        // //  resolve!
        // const resolvedReturnType = combineTypes("||", returnStatements.map(s => s.argument.type!));
        // return node.patch({ resolved: true, returnType: resolvedReturnType });
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