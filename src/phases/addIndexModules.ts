import Assembly from "../ast/Assembly";
import { traverse, skip } from "../Traversal";
import { Module, VariableDeclaration, Id, Reference, ImportStep, MemberExpression } from "../ast";
import { PATH_SEPARATOR, EXPORT_DELIMITER, getAbsoluteName, getLastName, getLast } from "../common";
import { EmptyLocation } from "../types";

export default function addIndexModules(root: Assembly) {
    let moduleNames = new Set<string>([""])
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
                let steps = name.split(PATH_SEPARATOR)
                for (let i = 1; i <= steps.length; i++) {
                    moduleNames.add(steps.slice(0, i).join(PATH_SEPARATOR))
                }
            }
            //  add implicit libraries for indexes
            if (Assembly.is(node)) {
                let newIndexModules = new Map<string,Module>()
                for (let name of moduleNames) {
                    if (!node.modules.has(name)) {
                        let children = Array.from(moduleNames.keys()).filter(function isChild(child) {
                            if (child === name || !child.startsWith(name)) {
                                return false
                            }
                            let remainder = name.length > 0 ? child.slice(name.length + 1) : child
                            return remainder.indexOf(PATH_SEPARATOR) < 0
                        }).map(name => getAbsoluteName(name, getLastName(name)))
                        let declarations = children.map(child => {
                            return new VariableDeclaration({
                                id: new Id({ name: getLastName(child) }),
                                value: new Reference({ name: child })
                                //  new MemberExpression({
                                //     object: new Reference({ name: "_" + name }),
                                //     property: new Id({ name })
                                // })
                            }) as VariableDeclaration & { value: MemberExpression & { object: Reference } }
                        })
                        console.log(">>>>>>>>>> " + name + " => " + children.join(", "))
                        newIndexModules.set(name, new Module({
                            location: EmptyLocation.patch({ filename: name }),
                            imports: [], // declarations.map(d => new ImportStep({ id: d.id, as: new Id(d.value.object), relative: true, children: false })),
                            declarations
                        }))
                    }
                }
                return new Assembly({ modules: new Map([ ...node.modules.entries(), ...newIndexModules ])})
            }
        }
    })
}
