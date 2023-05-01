import { ArgPlaceholder } from "../../ast/ArgPlaceholder";
import { ArrayExpression } from "../../ast/ArrayExpression";
import { Assembly } from "../../ast/Assembly";
import { AssignmentExpression } from "../../ast/AssignmentExpression";
import { createBinaryExpression } from "../../ast/AstFunctions";
import { CallExpression } from "../../ast/CallExpression";
import { FunctionExpression } from "../../ast/FunctionExpression";
import { IndexExpression } from "../../ast/IndexExpression";
import { PstGroup } from "../../ast/PstGroup";
import { RangeExpression } from "../../ast/RangeExpression";
import { Reference } from "../../ast/Reference";
import { SequenceExpression } from "../../ast/SequenceExpression";
import { UnaryExpression } from "../../ast/UnaryExpression";
import { ParameterDeclaration } from "../../ast/VariableDeclaration";
import { CoreFunction } from "../../common/CoreType";
import { traverse } from "../../common/traverse";
import { InfixOperator } from "../../Operators";
import { TokenNames } from "../../parser/tokenizer/TokenTypes";
import { SemanticError } from "../../SemanticError";

export function postParser(assembly: Assembly) {
    return traverse(assembly, {
        leave(node) {
            if (node instanceof AssignmentExpression) {
                var { location, left, right, operator } = node;
                if (operator !== "=") {
                    // conversion to thingy.
                    right = createBinaryExpression(location, left, operator.slice(0, -1) as InfixOperator, right);
                }
                return new AssignmentExpression(location, left, right, "=");
            }
            if (node instanceof RangeExpression) {
                if (node.finish instanceof UnaryExpression) {
                    switch (node.finish.operator) {
                        case "<=": return node.patch({ finish: node.finish.argument, maxExclusive: false });
                        case "<": return node.patch({ finish: node.finish.argument, maxExclusive: true });
                        default: return node;
                    }
                }
            }
            if (node instanceof PstGroup) {
                if (node.open.type === TokenNames.OpenBracket) {
                    const elements = SequenceExpression.flatten(node.value);
                    return new ArrayExpression(node.location, elements);
                }
                if (node.value == null) {
                    throw new SemanticError(`Unexpected: ${node}`, node);
                }
                return node.value;
            }
            if (node instanceof IndexExpression) {
                //  if left hand side... then this should be converted to a set call
                //  if right hand side then this should be a get call
                return new CallExpression(node.location, new Reference(node.location, CoreFunction.get), [
                    node.object, node.index
                ]);
            }
        }
    });
}

export function replacePeerParameterReferencesWithArgPlaceholders(parameters: ParameterDeclaration[]): ParameterDeclaration[] {
    const names = new Map(parameters.map((p,i) => [p.id.name, i]));
    return parameters.map((p,i) => {
        let param = traverse(p, {
            leave(n) {
                if (n instanceof Reference) {
                    if (n.name === p.id.name) {
                        throw new SemanticError(`Cannot reference self in type declaration`, p.id, n);
                    }
                    const index = names.get(n.name);
                    if (index != null) {
                        let result = new ArgPlaceholder(n.location, index);
                        if (n.resolved) {
                            result = result.patch({ resolved: true, type: n.type });
                        }
                        return result;
                    }
                }
            }
        })
        return param;
    });
}