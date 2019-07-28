import Statement from "./Statement";
import Expression from "./Expression";
import BlockStatement from "./BlockStatement";

export default class WhileStatement extends Statement {

    test!: Expression
    body!: BlockStatement

}