/*
This file was generated from ion source. Do not edit.
*/
import * as String from './String';
import * as Class from './Class';
export class Type {
    readonly id: String.String;
    constructor({id}: { id: String.String }) {
        if (!String.isString(id))
            throw new Error('id is not a String: ' + Class.toString(id));
        this.id = id;
    }
    static is(value): value is Type {
        return isType(value);
    }
}
Type['id'] = 'ion_Type';
Type['implements'] = new Set(['ion_Type']);
export const isType = function (value): value is Type {
    return Class.isInstance(Type, value);
};
export default Type;