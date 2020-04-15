import Statement from "./Statement";
import Id from "./Id";

export default class Declaration extends Statement {

    /**
     * The identifier for this declaration.
     */
    id!: Id
    /**
     * Does this declaration have the export modifier?
     */
    export?: boolean

}