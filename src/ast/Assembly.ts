import Scope from "./Scope";
import ImportStep from "./ImportStep";
import Declaration from "./Declaration";
import Module from "./Module";

export default class Assembly extends Scope {

    modules!: { [name: string]: Module }

}