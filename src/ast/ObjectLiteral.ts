import Expression from "./Expression";
import KeyValuePair from "./KeyValuePair";

export default class ObjectLiteral extends Expression {

    type: "Array" | "Map" | "Object" | "Set" = "Object"
    elements!: Array<Expression | KeyValuePair>

}