/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as Scope from './Scope';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Map from './ion/Map';
import * as String from './ion/String';
import * as Declaration from './Declaration';
import * as Class from './ion/Class';
export class Analysis implements _Object.Object , Scope.Scope , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly declarations: Map.Map<String.String, Declaration.Declaration>;
    static readonly id = 'Analysis';
    static readonly implements = new Set([
        'Analysis',
        'ion_Object',
        'Scope',
        'Node'
    ]);
    constructor({location = null, declarations}: {
        location?: Location.Location | Null.Null,
        declarations: Map.Map<String.String, Declaration.Declaration>
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        if (!Map.isMap(declarations))
            throw new Error('declarations is not a Map: ' + declarations);
        this.location = location;
        this.declarations = declarations;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        declarations?: Map.Map<String.String, Declaration.Declaration>
    }) {
        return new Analysis({
            ...this,
            ...properties
        });
    }
    static is(value): value is Analysis {
        return isAnalysis(value);
    }
}
export function isAnalysis(value): value is Analysis {
    return Class.isInstance(Analysis, value);
}
export default Analysis;