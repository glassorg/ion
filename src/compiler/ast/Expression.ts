import * as kype from "@glas/kype";
import { Resolvable } from "./Resolvable";

export abstract class Expression extends Resolvable {

    public toKype(): kype.Expression {
        throw new Error("Not implemented yet");
    }

    /**
     * Returns a user friendly type string that should be similar to language normal type syntax.
     */
    public toUserTypeString() {
        return this.toString();
    }

    /**
     * Returns a string without type information that can be used to compare
     */
    abstract toString(includeTypes?: boolean): string;

}
