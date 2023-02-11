import { Assembly } from "../../ast/Assembly";
import { isRootDeclaration, RootDeclaration } from "../../ast/Declaration";
import { Declarator } from "../../ast/Declarator";
import { FunctionDeclaration } from "../../ast/FunctionDeclaration";
import { MultiFunction } from "../../ast/MultiFunction";
import { Reference } from "../../ast/Reference";
import { SourceLocation } from "../../ast/SourceLocation";
import { VariableDeclaration, VariableKind } from "../../ast/VariableDeclaration";
import { traverse } from "../../common/traverse";

export function insertMultiFunctions(assembly: Assembly) {

    const functionsByName = new Map<string, Reference[]>();
    function addFunction(d: FunctionDeclaration & RootDeclaration): RootDeclaration {
        let functions = functionsByName.get(d.id.name);
        if (!functions) {
            functionsByName.set(d.id.name, functions = []);
        }
        functions.push(new Reference(d.id.location, d.absolutePath!));
        return new VariableDeclaration(d.location, new Declarator(d.id.location, d.absolutePath), { value: d.value, kind: VariableKind.Constant }).patch({ absolutePath: d.absolutePath });
    }

    assembly = traverse(assembly, {
        leave(node) {
            if (node instanceof FunctionDeclaration && isRootDeclaration(node)) {
                node = addFunction(node);
            }
            return node;
        }
    })

    const location = SourceLocation.empty;
    const multiFunctions = [...functionsByName].map(([name, functions]) => new VariableDeclaration(location, new Declarator(location, name), { value: new MultiFunction(functions) }).patch({ absolutePath: name }));

    return assembly.patch({ declarations: [...assembly.declarations, ...multiFunctions ]});
}