import { Options } from "../Compiler";
import Analysis from "../ast/Analysis";
import { SemanticError, getUniqueClientName } from "../common";
import ClassDeclaration from "../ast/ClassDeclaration";
import Declaration from "../ast/Declaration";
import Reference from "../ast/Reference";
import Node from "../ast/Node";
import { traverse } from "../Traversal";

export default function inheritBaseClasses(root: Analysis, options: Options) {

    let finished = new Map<ClassDeclaration,ClassDeclaration>()
    let inprogress = new Set<ClassDeclaration>()
    function ensureDeclarationsInherited(classDeclaration: ClassDeclaration, source: Node): ClassDeclaration {
        let result = finished.get(classDeclaration)
        if (result == null) {
            if (inprogress.has(classDeclaration)) {
                throw SemanticError(`Circular class extension`, source)
            }
            inprogress.add(classDeclaration)
            let baseDeclarations: Declaration[] = []
            let baseClasses = new Set<Reference>()
            for (let baseClass of classDeclaration.baseClasses) {
                let baseDeclaration = root.declarations.get(baseClass.name)
                
                if (!ClassDeclaration.is(baseDeclaration)) {
                    console.log(baseClass)
                    throw SemanticError(`BaseClass is not a class declaration`, baseClass)
                }
                if (classDeclaration.isStructure && !baseDeclaration.isStructure) {
                    throw SemanticError(`Structs cannot inherit from classes`, baseClass)
                }
                ensureDeclarationsInherited(baseDeclaration, baseClass)
                for (let ref of baseDeclaration.baseClasses) {
                    baseClasses.add(ref)
                }
                baseDeclarations.push(...baseDeclaration.declarations)
            }
            // now insert the base declarations
            result = classDeclaration.patch({ declarations: [...baseDeclarations, ...classDeclaration.declarations] })
            // also add all of the subclasses recursively we implicitly implement all their interfaces
            // TODO: Need Readonly on arrays and shit.
            // classDeclaration.baseClasses.push(...baseClasses.values())
            finished.set(classDeclaration, result)
        }
        return result
    }

    return traverse(root, {
        leave(node) {
            if (ClassDeclaration.is(node)) {
                let declaration = ensureDeclarationsInherited(node, node)
                // TODO: Do we really need to track these implements here?
                // or is there another way later to determine these?
                return declaration.patch({ _implements: [getUniqueClientName(node.id.name), ...node.baseClasses.map(d => getUniqueClientName(d.name))] })
            }
        }
    })

}