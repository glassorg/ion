import Node from "./Node";
import Id from "./Id";

export default class ImportStep extends Node {

    relative: boolean = false
    id: Id | null = null
    as: Id | null = null
    children!: Array<ImportStep>

}