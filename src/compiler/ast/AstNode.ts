import { Immutable } from "../Immutable";
import { PositionFactory } from "../PositionFactory";

export class AstNode extends Immutable {

    constructor(
        public readonly position: number
    ) {
        super();
    }

    toJSON() {
        let { position, ...rest } = this;
        return { ...rest, position: PositionFactory.toObject(position) };
    }

}