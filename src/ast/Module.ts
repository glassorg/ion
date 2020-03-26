import Scope from "./Scope";
import ImportStep from "./ImportStep";
import Declaration from "./Declaration";
import { mixin } from "./runtime";
import Id from "./Id";

export default class Module extends Scope {

    id!: Id
    imports!: Array<ImportStep>
    declarations!: Array<Declaration>
    // exports!: Array<Declaration>

}
// mixin(Module, Scope)
