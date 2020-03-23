import Scope from "./Scope";
import ImportStep from "./ImportStep";
import Declaration from "./Declaration";
import Module from "./Module";
import File from "./File";

export default class Assembly extends Scope {

    modules!: { [name: string]: Module }
    files?: File[]

}