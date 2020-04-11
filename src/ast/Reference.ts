import Id from "./Id";
import Expression from "./Expression";
import { mixin } from "./runtime";
import { is } from "./Node";
import Location from "./Location";

export function getExternalReferenceName(fileName, exportName) {
    return fileName + ":" + exportName
}

export type ExternalReference = Reference & { _file: string, _export: String }

export default class Reference extends Id implements Expression {

    _file?: string
    _export?: string
    _isType: boolean

    constructor(args: { name: string, location?: Location }) {
        super(args)

        let colon = this.name.lastIndexOf(':')
        if (colon > 0) {
            this._file = this.name.slice(0, colon)
            this._export = this.name.slice(colon + 1)
        }
        let name = this._export ?? this.name
        let first = name[0]
        this._isType = first.toUpperCase() === first
    }

    static is(node): node is Reference {
        return is(node, this)
    }

    isExternal(): this is ExternalReference {
        return this._file != null && this._export != null;
    }

}

mixin(Reference, Expression)