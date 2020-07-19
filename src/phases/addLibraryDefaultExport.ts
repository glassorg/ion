import Assembly from "../ast/Assembly";
import { traverse, skip } from "../Traversal";
import { Module, Property, Reference, ObjectExpression, VariableDeclaration, Id } from "../ast";
import { PATH_SEPARATOR } from "../common";

export default function addLibraryDefaultExports(root: Assembly) {
    return traverse(root, {
        enter(node) {
            if (Module.is(node)) {
                return skip
            }
        },
        leave(node, ancestors, path) {
            // add default export object for libraries
            if (Module.is(node)) {
                let name = path[path.length - 1]
                let localName = name.slice(name.lastIndexOf(PATH_SEPARATOR) + 1)
                let isTypeModule = node.declarations.find(d => d.id.name === localName)
                let isLibrary = !isTypeModule
                if (isLibrary) {
                    let properties = node.declarations.map(d => new Property({ key: d.id, value: new Reference(d.id) }))
                    let libraryObject = new ObjectExpression({ properties })
                    let libraryDeclaration = new VariableDeclaration({ id: new Id({ name: localName }), value: libraryObject })
                    return node.patch({
                        declarations: node.declarations.concat([libraryDeclaration])
                    })
                }
            }
        }
    })
}
