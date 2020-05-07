/*
This file was generated from ion source. Do not edit.
*/
import * as Scope from './Scope';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Array from './ion/Array';
import * as ImportStep from './ImportStep';
import * as Declaration from './Declaration';
import * as Class from './ion/Class';
export class Module implements Scope.Scope , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly imports: Array.Array<ImportStep.ImportStep>;
    readonly declarations: Array.Array<Declaration.Declaration>;
    constructor({location = null, imports = [], declarations}: {
        location?: Location.Location | Null.Null,
        imports?: Array.Array<ImportStep.ImportStep>,
        declarations: Array.Array<Declaration.Declaration>
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!Array.isArray(imports))
            throw new Error('imports is not a Array: ' + Class.toString(imports));
        if (!Array.isArray(declarations))
            throw new Error('declarations is not a Array: ' + Class.toString(declarations));
        this.location = location;
        this.imports = imports;
        this.declarations = declarations;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        imports?: Array.Array<ImportStep.ImportStep>,
        declarations?: Array.Array<Declaration.Declaration>
    }) {
        return new Module({
            ...this,
            ...properties
        });
    }
    static is(value): value is Module {
        return isModule(value);
    }
}
Module['id'] = 'Module';
Module['implements'] = new Set([
    'Module',
    'Scope',
    'Node'
]);
export function isModule(value): value is Module {
    return Class.isInstance(Module, value);
}
export default Module;