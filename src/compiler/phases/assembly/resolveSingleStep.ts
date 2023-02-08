import { Assembly } from "../../ast/Assembly";
import { Expression, isResolvable } from "../../ast/Expression";
import { traverseWithContext } from "../../common/traverse";
import { AstNS } from "../../ast/AstTypes";
import { EvaluationContext } from "../../EvaluationContext";
import { AstNode } from "../../ast/AstNode";
import { Reference } from "../../ast/Reference";
import { InferredType } from "../../ast/InferredType";
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

function BooleanType(location: SourceLocation) {
    return new ComparisonExpression(location,
        new DotExpression(location),
        "is",
        new Reference(location, CoreTypes.Boolean)
    // the patch of resolvedType ensures no recursive resolution.
    ).patch({ resolvedType: new InferredType(location) });
}

function LiteralType(node: Literal<any>) {
    return joinExpressions("&&", [
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
            // must have type specified to avoid infinite recursion
            node.patch({ resolvedType: new InferredType(node.location) })
        ),
    ]);
}

type ResolveFunction<T extends (new (...args: any) => AstNode)> = (node: InstanceType<T>, c: EvaluationContext) => AstNode | void

const maybeResolveNode: {
    [Key in keyof AstNS]?: AstNS[Key] extends (new (...args: any[]) => AstNode) ? ResolveFunction<AstNS[Key]> : never
} = {
    AssignmentExpression(node, c) {
        if (!node.right.resolvedType) {
            return;
        }
        return node.patch({ resolvedType: node.right.resolvedType });    
    },
    UnaryExpression(node, c) {
        console.log("CHECK: " + node.toString() + " resolved type: " + node.argument.resolvedType);
        if (!node.argument.resolvedType) {
            return;
        }
        if (node.operator === "typeof") {
            if (node.argument.resolvedType) {
                // convert this to the underlying typeof value.
                return node.argument.resolvedType!
            }
        }
        //  are we sure that's right? I don't think it is
        //  Unary ! stays boolean
        //  Unary - should change the sign of the resolved type...
        return node.patch({ resolvedType: node.argument.resolvedType });    
    },
    ParameterDeclaration(node, c) {
        if (node.declaredType?.resolved) {
            return node.patch({ resolvedType: node.declaredType });
        }
        if (node.defaultValue?.resolvedType) {
            return node.patch({ resolvedType: node.defaultValue.resolvedType });
        }
    },
    VariableDeclaration(node, c) {
        if (node.declaredType) {
            if (node.declaredType.resolvedType?.resolved) {
                return node.patch({ resolvedType: node.declaredType });
            }
        }
        else if (node.defaultValue) {
            if (node.defaultValue.resolvedType?.resolved) {
                return node.patch({ resolvedType: node.defaultValue.resolvedType });
            }
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
        let type = node.value.resolvedType!;
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
        return node.patch({ resolvedType: type });
    },
    CallExpression(node, c) {
        // functions need to be resolved into inferred types or something.
        if (!node.callee.resolved || !(node.args.every(arg => arg.resolved))) {
            return
        }

        // boom, we have the correctly resolved types.
        const argTypes = node.args.map(arg => c.getType(arg));
        let functionTypes = c.getFunctionTypes(node.callee, argTypes);
        if (Array.isArray(functionTypes)) {
            functionTypes = functionTypes.filter(type => type.value.areArgumentsValid(argTypes) !== false);
            if (functionTypes.length === 0) {
                throw new SemanticError(`${node.callee} Function with these parameters not found`, node);
            }
            const returnTypes = functionTypes.map(declaration => declaration.getReturnType(argTypes, node)).filter(Boolean) as Expression[];
            const resolvedType = combineTypes("||", returnTypes);
            return resolvedType;
        }
        else {
            throw new Error("Not handled yet");
        }        
    },
    ComparisonExpression(node, c) {
        return node.patch({ resolvedType: BooleanType(node.location) });
    },
    LogicalExpression(node, c) {
        return node.patch({ resolvedType: BooleanType(node.location) });
    },
    FloatLiteral(node, c) {
        return node.patch({ resolvedType: LiteralType(node) });
    },
    StringLiteral(node, c) {
        return node.patch({ resolvedType: LiteralType(node) });
    },
    IntegerLiteral(node, c) {
        return node.patch({ resolvedType: LiteralType(node) });
    },
    Reference(node, c) {
        const declarations = c.getDeclarations(node);
        if (declarations.length === 1) {
            const declaration = declarations[0];
            if (!declaration.resolved) {
                // wait for a single function to be resolved.
                return;
            }
            const resolvedType = declaration.declaredType
            if (declaration instanceof ConstantDeclaration) {
                const { value } = declaration;
                if (value instanceof Literal || value instanceof Reference) {
                    return (value as Expression).patch({ resolvedType });
                }
            }
            return node.patch({ resolvedType });
        }
        //  if it's multiple functions then we will type it as Inferred
        // this is a multi function so we will consider the type inferred, maybe should be something else?
        return node.patch({ resolvedType: new InferredType(node.location) });
    },
    FunctionExpression(node, c) {
        //  node resolved?
        if (node.resolvedReturnType && node.resolvedType) {
            return;
        }
        //  dependencies resolved?
        const returnStatements = [...node.getReturnStatements()];
        for (const statement of returnStatements) {
            if (!statement.argument.resolvedType) {
                return;
            }
        }
        //  resolve!
        const resolvedReturnType = combineTypes("||", returnStatements.map(s => s.argument.resolvedType!));
        const resolvedType = new InferredType(node.location);
        return node.patch({ resolvedType, resolvedReturnType });
    }
};

export const repeatSuffix = "_N";
export function resolveSingleStep_N(root: Assembly): Assembly {
    return traverseWithContext(root, c => {
        return ({
            leave(node) {
                if (isResolvable(node) && !node.resolved) {
                    node = (maybeResolveNode as any)[node.constructor.name]?.(node, c) ?? node;
                }
                return node;
            }
        });
    })
}