import { Reference } from "./Reference";

export class AbsoluteReference extends Reference {

    get isAbsolute() {
        return true;
    }

}