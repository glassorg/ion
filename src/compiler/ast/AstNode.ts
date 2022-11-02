import { Immutable } from "../Immutable";

export class AstNode extends Immutable {

    constructor(
        public readonly position: number
    ) {
        super();
    }

    toJSON() {
        let { position, ...rest } = super.toJSON();
        return rest;
    }

}