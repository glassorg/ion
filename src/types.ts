import Reference from "./ast/Reference";
import { Position, Location } from "./ast";
import * as pathFunctions from "./pathFunctions";

function ref(name: string) {
    return new Reference({ name: pathFunctions.absolute(...name.split('.')) })
}

export const Boolean = ref("ion.Boolean")
export const String = ref("ion.String")
export const Number = ref("ion.Number")
export const Array = ref("ion.Array")
export const Map = ref("ion.Map")
export const Set = ref("ion.Set")
export const Class = ref("ion.Class")
export const Type = ref("ion.Type")
export const Object = ref("ion.Object")
export const Null = ref("ion.Null")
export const Any = ref("ion.Any")
export const Never = ref("ion.Never")

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
