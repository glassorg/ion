import { Declarator } from "./Declarator";
import { SourceLocation } from "./SourceLocation";
import { Statement } from "./Statement";

export abstract class Declaration extends Statement {

    constructor(
        location: SourceLocation,
        public readonly id: Declarator
    ){
        super(location);
    }

}