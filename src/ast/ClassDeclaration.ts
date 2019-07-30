import Declaration from "./Declaration";
import Parameter from "./Parameter";
import Reference from "./Reference";
import KeyValuePair from "./KeyValuePair";

export default class ClassDeclaration extends Declaration {

    isAbstract!: boolean
    templateParameters!: Array<Parameter>
    baseClasses!: Array<Reference>
    declarations!: Array<Declaration>
    meta!: Array<KeyValuePair>

}