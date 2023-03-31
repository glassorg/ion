import * as kype from "@glas/kype";
import { Resolvable } from "./Resolvable";

export abstract class Expression extends Resolvable {

    public toKype(): kype.Expression {
        throw new Error("Not implemented yet");
    }

    /**
     * Returns a string without type information that can be used to compare
     */
    abstract toString(includeTypes?: boolean): string;

}
