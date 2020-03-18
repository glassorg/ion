
export format

two types of modules
1. Type
    exports a single type
    any other constant values must be statically defined on the type

    export
        class Point
            //  values are always considered constant
            x = 10
            y = 20

        myStatic 1 = foo
        myStaticDouble(value) => value * 2

    in javascript is converted to a single "export default class Point.."
2. Library
    exports multiple constant values

    export
        myStatic 1 = foo
        myStaticDouble(value) => value * 2

TODO:
    Convert to allow multiple export sections and inline export modifier

Do we need let and var declarations at all?
    They aren't needed for static or instance variables.
    Only potentially needed in functions.
    If every instance is immutable... then we can only potentially reassign variables
    