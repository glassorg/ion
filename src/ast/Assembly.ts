/*
This file was generated from ion source. Do not edit.
*/
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Map from './ion/Map';
import * as String from './ion/String';
import * as Module from './Module';
import * as Class from './ion/Class';
export class Assembly implements Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly modules: Map.Map<String.String, Module.Module>;
    constructor({location = null, modules}: {
        location?: Location.Location | Null.Null,
        modules: Map.Map<String.String, Module.Module>
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!Map.isMap(modules))
            throw new Error('modules is not a Map: ' + Class.toString(modules));
        this.location = location;
        this.modules = modules;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        modules?: Map.Map<String.String, Module.Module>
    }) {
        return new Assembly({
            ...this,
            ...properties
        });
    }
    static is(value): value is Assembly {
        return isAssembly(value);
    }
}
Assembly['id'] = 'Assembly';
Assembly['implements'] = new Set([
    'Assembly',
    'Node'
]);
export const isAssembly = function (value): value is Assembly {
    return Class.isInstance(Assembly, value);
};
export default Assembly;