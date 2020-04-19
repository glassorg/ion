# ion
Multiplatform Data Modeling Language featuring dependent types, immutability, validation

## Design

    Possible convenience format for authoring multiple Point related functions.
    Drawback is that in a long list this imlicit argument may be off screen.
    (point: Point)
        let translate = (x: Number, y: Number) -> new Point(point.x + x, point.y + y)
        let rotate =->

## TODO
    X add type guard on is<Type> functions
    X fix undefined in Point3
    X add types to constructor parameters
    X default values on struct parameters
    X struct parameters vs class parameters => constructor({x = 0, y = 0}: { x?: Whole, y?: Whole })
    X add is<Type> functions to classes for runtime type checking
    X add type guard to isClass functions
    X add Class.isClass functions with type guard.
    - figure out how to publish and consume ion
        decision use npmjs with ion prefix:
            ion.ion
            ion.sample
            ion.glass.graphics
    - publish compiler
