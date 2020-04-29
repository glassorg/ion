/*
This file was generated from ion source. Do not edit.
*/
import * as Scope from './Scope';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Map from './ion/Map';
import * as String from './ion/String';
import * as Declaration from './Declaration';
import * as Class from './ion/Class';
export class Analysis {
    readonly location: Location.Location | Null.Null;
    readonly declarations: Map.Map<String.String, Declaration.Declaration>;
    constructor({location = null, declarations}: {
        location?: Location.Location | Null.Null,
        declarations: Map.Map<String.String, Declaration.Declaration>
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!Map.isMap(declarations))
            throw new Error('declarations is not a Map: ' + Class.toString(declarations));
        this.location = location;
        this.declarations = declarations;
        Object.freeze(this);
    }
    static is(value): value is Analysis {
        return isAnalysis(value);
    }
}
Analysis['id'] = 'Analysis';
Analysis['implements'] = new Set([
    'Analysis',
    'Scope',
    'Node'
]);
export const isAnalysis = function (value): value is Analysis {
    return Class.isInstance(Analysis, value);
};
export default Analysis;