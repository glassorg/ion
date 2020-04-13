import Input from "../ast/Input";
import { Options } from "../Compiler";
import Analysis from "../ast/Analysis";
import { Node, ClassDeclaration, Declaration } from "../ast";
import { SemanticError, clone } from "../common";

export default function inheritBaseClasses(root: Analysis, options: Options) {

    let finished = new Set<ClassDeclaration>()
    let inprogress = new Set<ClassDeclaration>()
    function ensureDeclarationsInherited(classDeclaration: ClassDeclaration, source: Node) {
        if (!finished.has(classDeclaration)) {
            if (inprogress.has(classDeclaration)) {
                throw SemanticError(`Circular class extension`, source)
            }
            inprogress.add(classDeclaration)
            let baseDeclarations: Declaration[] = []
            for (let baseClass of classDeclaration.baseClasses) {
                let baseDeclaration = root.declarations[baseClass.name]
                if (!ClassDeclaration.is(baseDeclaration)) {
                    throw SemanticError(`BaseClass is not a class declaration`, baseClass)
                }
                if (classDeclaration.isStructure && !baseDeclaration.isStructure) {
                    throw SemanticError(`Structs cannot inherit from classes`, baseClass)
                }
                ensureDeclarationsInherited(baseDeclaration, baseClass)
                baseDeclarations.push(...clone(baseDeclaration.declarations))
            }
            // now insert the base declarations
            classDeclaration.declarations = [...baseDeclarations, ...classDeclaration.declarations]
            finished.add(classDeclaration)
        }
    }

    for (let name in root.declarations) {
        let declaration = root.declarations[name]
        if (ClassDeclaration.is(declaration)) {
            ensureDeclarationsInherited(declaration, declaration)
        }
    }

}