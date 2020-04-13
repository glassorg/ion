import Scope from "./Scope";
import Declaration from "./Declaration";

export default class Analysis extends Scope {

    declarations!: { [name: string]: Declaration }

    constructor(...args: Readonly<Analysis>[]) {
        super(...args)
    }

}