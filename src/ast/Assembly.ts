import Scope from "./Scope";
import Module from "./Module";
import File from "./File";

export default class Assembly extends Scope {

    // how would we type this in ion?
    //  Map<string,Module>
    //  key insertion order is preserved in our maps.
    modules!: { [name: string]: Module }
    files?: File[]

}