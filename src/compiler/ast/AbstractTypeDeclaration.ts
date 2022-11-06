import { Declaration } from "./Declaration";
import { TypeExpression } from "./TypeExpression";

export abstract class AbstractTypeDeclaration extends Declaration {

    abstract readonly type: TypeExpression;

}