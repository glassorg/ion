import { Assembly } from "../../ast/Assembly";
import { AssignmentExpression } from "../../ast/AssignmentExpression";
import { joinExpressions } from "../../ast/AstFunctions";
import { AstNode } from "../../ast/AstNode";
import { BlockStatement } from "../../ast/BlockStatement";
import { ConditionalAssertion } from "../../ast/ConditionalAssertion";
import { Declarator } from "../../ast/Declarator";
import { ExpressionStatement } from "../../ast/ExpressionStatement";
import { ForStatement } from "../../ast/ForStatement";
import { Identifier } from "../../ast/Identifier";
import { IfStatement } from "../../ast/IfStatement";
import { Reference } from "../../ast/Reference";
import { ReturnStatement } from "../../ast/ReturnStatement";
import { isScopeNode, ScopeNode } from "../../ast/ScopeNode";
import { Statement } from "../../ast/Statement";
import { UnaryExpression } from "../../ast/UnaryExpression";
import { VariableDeclaration, VariableKind } from "../../ast/VariableDeclaration";
import { traverse, traverseWithContext } from "../../common/traverse";
import { EvaluationContext } from "../../EvaluationContext";

const ssaVersionSeparator = ":";

export function isSSAVersionName(name: string) {
    return name.lastIndexOf(ssaVersionSeparator) >= 0;
}

export function getSSAVersionName(name: string, count: number) {
    return `${name}${ssaVersionSeparator}${count}`;
}

export function getSSAVersionNumber(name: string) {
    let index = name.lastIndexOf(ssaVersionSeparator);
    if (index < 0) {
        return 0;
    }
    return parseInt(name.slice(index + 1));
}

export function getSSAUniqueName(name: string) {
    let lastIndex = name.lastIndexOf(ssaVersionSeparator);
    return lastIndex >= 0 ? name.slice(0, lastIndex) : name;
}

export function getSSAOriginalName(name: string) {
    let lastIndex = name.indexOf(ssaVersionSeparator);
    return lastIndex >= 0 ? name.slice(0, lastIndex) : name;
}

export function getSSANextVersion(name: string) {
    return getSSAVersionName(getSSAUniqueName(name), getSSAVersionNumber(name) + 1);
}

export function getScope(ancestors: object[]): ScopeNode {
    for (let i = ancestors.length - 1; i >= 0; i--) {
        let ancestor = ancestors[i];
        if (isScopeNode(ancestor)) {
            return ancestor;
        }
    }
    throw new Error("No Scope found");
}

function getFinalSSAVersionVariable(block: Statement | null | undefined, originalName: string): VariableDeclaration | null {
    let prefix = originalName + ssaVersionSeparator;
    if (block instanceof VariableDeclaration && block.id.name.startsWith(prefix)) {
        return block;
    }
    if (block instanceof BlockStatement) {
        let { statements } = block;
        for (let i = statements.length - 1; i >= 0; i--) {
            let node = statements[i];
            let found = getFinalSSAVersionVariable(node, originalName);
            if (found) {
                return found;
            }
        }
    }
    return null;
}

export function getAncestorsUpToFirstCommon(c: EvaluationContext, childAncestors: object[], relative: AstNode) {
    let relativeAncestors = [...c.lookup.getAncestors(relative)];
    while (childAncestors.length > 1 && childAncestors[childAncestors.length - 2] === relativeAncestors[relativeAncestors.length - 2]) {
        childAncestors.pop();
        relativeAncestors.pop();
    }
    return childAncestors;
}

export function getVariableIfWithinLoop(c: EvaluationContext, ref: Reference, ancestors: object[]) {
    let variable = c.getDeclaration(ref);
    let commonAncestors = getAncestorsUpToFirstCommon(c, ancestors, variable);
    let withinLoop = commonAncestors.find(ancestor => ancestor instanceof ForStatement) != null;
    return withinLoop ? variable : null;
}

export function removeSSAVersions<T extends Object>(node: T): T {
    return traverse(node, {
        leave(node) {
            if (node instanceof Reference || node instanceof Identifier) {
                let originalName = getSSAOriginalName(node.name);
                if (node.name !== originalName) {
                    node = node.patch({ name: originalName });
                }
            }
            return node;
        }
    }) as T;
}

class Converter {

    originalName: string;
    currentName: string;
    lastName: string;

    constructor(originalName: string, currentName: string) {
        this.originalName = originalName;
        this.currentName = currentName;
        this.lastName = currentName;
    }

    getNextName() {
        return this.currentName = this.lastName = getSSANextVersion(this.lastName);
    }

    convert(c: EvaluationContext, block: BlockStatement): BlockStatement {
        let stack = new Array<string>();
        let originalVariable!: VariableDeclaration;
        let isOriginalVariableAssignedWithinLoops = false;
        let variablesAndReferences = new Set<VariableDeclaration | Reference>();
        let track = (varOrRef: VariableDeclaration | Reference): typeof varOrRef => {
            variablesAndReferences.add(varOrRef);
            return varOrRef;
        } 
        let result = traverse(block, {
            enter: (node, ancestors) => {
                if (node instanceof BlockStatement) {
                    stack.push(this.currentName);
                }
            },
            leave: (node, ancestors) => {
                let parent = ancestors[ancestors.length - 1];
                if (node instanceof VariableDeclaration && node.id.name === this.originalName) {
                    return track(originalVariable = node.patch({
                        id: node.id.patch({ name: this.currentName })
                    }));
                }
                if (node instanceof ExpressionStatement && node.expression instanceof AssignmentExpression && node.expression.left instanceof Reference && node.expression.left.name === this.originalName) {
                    let { right: value } = node.expression;
                    let id = node.expression.left as Reference;
                    let withinLoop = getVariableIfWithinLoop(c, id, ancestors);
                    if (withinLoop) {
                        isOriginalVariableAssignedWithinLoops = true;
                    }
                    let conditional = value instanceof ConditionalAssertion ? true : undefined;
                    //  if we are within a loop, our type must remain the declared type
                    //  otherwise we can infer a much more specific type
                    let type = withinLoop ? originalVariable.type : undefined;
                    return track(new VariableDeclaration(
                        node.location,
                        new Declarator(id.location, this.getNextName()),
                        { type,value }
                    ));
                }
                if (node instanceof Reference && node.name === this.originalName && !(parent instanceof AssignmentExpression && parent.left === node)) {
                    return track(node.patch({ name: this.currentName }));
                }
                if (node instanceof IfStatement) {
                    const continues = !(
                        node.consequent.lastStatement instanceof ReturnStatement
                        && (node.alternate == null || node.alternate.lastStatement instanceof ReturnStatement)
                    );
                    if (continues) {
                        //  1. get the final ssa variables in each branch: (consequent, alternate)
                        //  2. create a PHI declaration that merges those types.
                        //  3. add it after the end of the IfStatement.
                        let consequent = getFinalSSAVersionVariable(node.consequent, this.originalName);
                        let alternate = getFinalSSAVersionVariable(node.alternate, this.originalName);
                        let vars = [consequent, alternate].filter(Boolean) as VariableDeclaration[];
                        if (vars.length > 0) {
                            if (vars.length < 2) {
                                vars.push(originalVariable);
                            }
    
                            let types = vars.map(v => new UnaryExpression(
                                v.location, "typeof", new Reference(v.location, v.id.name)
                            ));
                            let type = joinExpressions("||", types);
                            let phi = new VariableDeclaration(
                                originalVariable.location,
                                originalVariable.id.patch({ name: this.getNextName() }),
                                { type, kind: VariableKind.Phi },
                            )
                            return new BlockStatement(
                                originalVariable.location,
                                [node, phi]
                            );
                        }
                    }
                }
                if (node instanceof BlockStatement) {
                    this.currentName = stack.pop()!;
                }
                return node;
            }
        });
        if (isOriginalVariableAssignedWithinLoops) {
            result = traverse(result, {
                leave: (node, ancestors) => {
                    if (variablesAndReferences.has(node)) {
                        let varOrRef = node as VariableDeclaration | Reference;
                        // we must convert ALL variable references and SSA declarations to use
                        return varOrRef.patch({ type: originalVariable.type });
                    }
                }
            });
        }
        return result;
    }

}

export function ssaForm(assembly: Assembly) {
    let varNumbers = new Map<string,number>();
    function getNewVarName(name: string) {
        let count = varNumbers.get(name) ?? 1;
        varNumbers.set(name, count + 1);
        return getSSAVersionName(`${name}${ssaVersionSeparator}${count}`, 0);
    }
    let result = traverseWithContext(assembly, (c) => {
        return {
            leave(node: AstNode) {
                if (node instanceof BlockStatement) {
                    let variables = [...node.statements]
                        .filter(n => n instanceof VariableDeclaration) as VariableDeclaration[];
                    if (variables.length > 0) {
                        for (let variable of variables) {
                            let name = getNewVarName(variable.id.name);
                            let converter = new Converter(variable.id.name, name);
                            node = converter.convert(c, node as BlockStatement);
                        }
                    }
                }
                return node;
            }
        };
    });

    return result;
}
