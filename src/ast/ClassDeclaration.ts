import Declaration from "./Declaration";
import Parameter from "./Parameter";
import Reference from "./Reference";
import KeyValuePair from "./KeyValuePair";
import { is } from "./Node";

export default class ClassDeclaration extends Declaration {

    isStructure!: boolean
    parameters!: Array<Parameter>
    baseClasses!: Array<Reference>
    declarations!: Array<Declaration>
    meta!: Array<KeyValuePair>
    // used by runtime type checking
    interfaces?: Array<Reference>
    implements?: Array<String>

    static is(node): node is ClassDeclaration {
        return is(node, this)
    }

}