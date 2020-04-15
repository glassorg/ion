import Id from "./Id";
import Declaration from "./Declaration";

export default class ImportDeclaration extends Declaration {

    id!: Id
    from!: string

    constructor(...args: Readonly<ImportDeclaration>[]) {
        super(...args)
    }

}