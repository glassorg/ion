import Statement from "./Statement";
import Expression from "./Expression";
import BlockStatement from "./BlockStatement";

export default class IfStatement extends Statement {

    test!: Expression
    consequent!: BlockStatement
    alternate: BlockStatement | IfStatement | null = null

}