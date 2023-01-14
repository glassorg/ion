import { Assembly } from "../../ast/Assembly";
import { SemanticError } from "../../SemanticError";

export function identity(assembly: Assembly) {
    let errors: SemanticError[] = [];
    if (errors.length > 0) {
        throw errors;
    }
    return assembly;
}