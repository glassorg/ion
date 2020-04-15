import Expression from "./Expression";
import Scope from "./Scope";
import Id from "./Id";
import Parameter from "./Parameter";
import BlockStatement from "./BlockStatement";
import Reference from "./Reference";

export default class FunctionExpression extends Expression implements Scope {

    id?: Id
    parameters!: Array<Parameter>
    returnType?: Expression
    body!: BlockStatement
    // indicates this function checks if the only parameter is an instance of Reference
    // https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types
    typeGuard?: Reference

}