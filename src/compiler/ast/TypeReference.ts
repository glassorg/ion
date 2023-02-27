import { Reference } from "./Reference";
import { Type } from "./Type";

export class TypeReference extends Reference implements Type {

    get isType(): true { return true; }

}