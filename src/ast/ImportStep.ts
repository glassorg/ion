import Node from "./Node";
import Id from "./Id";

export default class ImportStep extends Node {

    relative?: boolean
    id?: Id
    as?: Id
    children!: Array<ImportStep> | boolean

}