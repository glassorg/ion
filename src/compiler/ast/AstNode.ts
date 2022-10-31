import { Immutable } from "../Immutable";
import { PositionFactory } from "../PositionFactory";

export class AstNode extends Immutable {

    constructor(
        public readonly position: number
    ) {
        super();
    }

    toJSON() {
        let { position, ...rest } = super.toJSON();
        return rest;
        // return { ...rest, position: PositionFactory.toDotString(position) };
    }

}