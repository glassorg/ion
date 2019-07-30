import Expression from "./Expression";
import Scope from "./Scope";
import Id from "./Id";
import Parameter from "./Parameter";
import BlockStatement from "./BlockStatement";
import TypeExpression from "./TypeExpression";

export default class FunctionType extends TypeExpression {

    parameters!: Array<Parameter>
    returnType?: Expression

}