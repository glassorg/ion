import Expression from "./Expression";
import Scope from "./Scope";
import Id from "./Id";
import Parameter from "./Parameter";
import BlockStatement from "./BlockStatement";

export default class FunctionExpression extends Expression implements Scope {

    id?: Id
    parameters!: Array<Parameter>
    returnType?: Expression
    body!: BlockStatement

}