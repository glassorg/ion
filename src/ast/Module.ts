import Scope from "./Scope";
import ImportStep from "./ImportStep";
import Declaration from "./Declaration";
import { mixin } from "./runtime";

export default class Module extends Declaration implements Scope {

    imports!: Array<ImportStep>
    declarations!: Array<Declaration>
    exports!: Array<Declaration>

}
mixin(Module, Scope)
