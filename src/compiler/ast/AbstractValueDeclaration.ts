import { Declaration } from "./Declaration";
import { Declarator } from "./Declarator";
import { SourceLocation } from "./SourceLocation";
import { TypeExpression } from "./TypeExpression";

/**
 * Base class for declarations which define runtime values.
 */
export abstract class AbstractValueDeclaration extends Declaration {

    constructor(
        location: SourceLocation,
        id: Declarator,
        declaredType?: TypeExpression,
    ) {
        super(location, id, declaredType);
    }
    
}