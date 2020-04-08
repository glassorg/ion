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
    export!: boolean
    /**
     * The original file this was declared in. We use this to reconstitute individual files later.
     */
    file?: string

}