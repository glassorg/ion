import Scope from "./Scope";
import ImportStep from "./ImportStep";
import Declaration from "./Declaration";

export default class Module extends Scope {

    imports!: Array<ImportStep>
    declarations!: Array<Declaration>
    exports!: Array<Declaration>

}