import Statement from "./Statement";
import Reference from "./Reference";
import Expression from "./Expression";

export default class AssignmentStatement extends Statement {

    left!: Reference
    right!: Expression

}