import Assembly from "../ast/Assembly";
import { Options } from "../Compiler";
import Analysis from "../ast/Analysis";
import { Node, ClassDeclaration, Declaration, Reference } from "../ast";
import { SemanticError, clone, getUniqueClientName, getTypeCheckFunctionName } from "../common";

function mergeDeclarations(base: Declaration, sub: Declaration) {
    // this should actually check that the types can be merged.
    return sub
}

export default function inheritBaseClasses(root: Analysis, options: Options) {

    let finished = new Set<ClassDeclaration>()
    let inprogress = new Set<ClassDeclaration>()
    function ensureDeclarationsInherited(classDeclaration: ClassDeclaration, source: Node) {
        if (!finished.has(classDeclaration)) {
            if (inprogress.has(classDeclaration)) {
                throw SemanticError(`Circular class extension`, source)
            }
            inprogress.add(classDeclaration)
            let baseDeclarations = new Map<string,Declaration>()
            function addDeclarations(declarations: Declaration[]) {
                for (let declaration of declarations) {
                    let current = baseDeclarations.get(declaration.id.name)
                    if (current) {
                        declaration = mergeDeclarations(current, declaration)
                    }
                    baseDeclarations.set(declaration.id.name, declaration)
                }
            }
            let baseClasses = new Set<Reference>()
            for (let baseClass of classDeclaration.baseClasses) {
                let baseDeclaration = root.declarations[baseClass.name]
                
                if (!ClassDeclaration.is(baseDeclaration)) {
                    throw SemanticError(`BaseClass is not a class declaration`, baseClass)
                }
                if (classDeclaration.isStructure && !baseDeclaration.isStructure) {
                    throw SemanticError(`Structs cannot inherit from classes`, baseClass)
                }
                ensureDeclarationsInherited(baseDeclaration, baseClass)
                for (let ref of baseDeclaration.baseClasses) {
                    baseClasses.add(ref)
                }
                addDeclarations(clone(baseDeclaration.declarations))
            }
            // now insert the base declarations
            addDeclarations(classDeclaration.declarations)
            classDeclaration.declarations = Array.from(baseDeclarations.values())
            // also add all of the subclasses recursively we implicitly implement all their interfaces
            classDeclaration.baseClasses.push(...baseClasses.values())
            finished.add(classDeclaration)
        }
    }

    for (let name in root.declarations) {
        let declaration = root.declarations[name]
        if (ClassDeclaration.is(declaration)) {
            ensureDeclarationsInherited(declaration, declaration)
            declaration.implements = [getUniqueClientName(declaration.id.name), ...declaration.baseClasses.map(d => getUniqueClientName(d.name))]
        }
    }

}