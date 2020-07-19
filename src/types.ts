import Reference from "./ast/Reference";
import { Position, Location } from "./ast";

export const Boolean = new Reference({ name: "ion.Boolean:Boolean" })
export const String = new Reference({ name: "ion.String:String" })
export const Number = new Reference({ name: "ion.Number:Number" })
export const Array = new Reference({ name: "ion.Array:Array" })
export const Map = new Reference({ name: "ion.Map:Map" })
export const Set = new Reference({ name: "ion.Set:Set" })
export const Class = new Reference({ name: "ion.Class:Class" })
export const Object = new Reference({ name: "ion.Object:Object" })
export const Null = new Reference({ name: "ion.Null:Null" })
export const Any = new Reference({ name: "ion.Any:Any" })
export const Never = new Reference({ name: "ion.Never:Never" })

export const EmptyLocation = new Location({ start: new Position(0, 0), end: new Position(0, 0), filename: "inferType.empty" })

function equals(a, b: Reference) {
    return a === b || Reference.is(a) && a.name === b.name
}

export function isAny(node): node is Reference {
    return equals(node, Any)
}

export function isNever(node): node is Reference {
    return equals(node, Never)
}
