import TypeExpression from "./TypeExpression";
import Reference from "./Reference";

export default class TemplateReference extends TypeExpression {

    baseType!: Reference
    arguments!: Array<TypeExpression | Reference>

}