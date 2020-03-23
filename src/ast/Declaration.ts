import Statement from "./Statement";
import Id from "./Id";

export default class Declaration extends Statement {

    id!: Id
    export!: boolean

}