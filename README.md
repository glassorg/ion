# ion
Multiplatform Data Modeling Language featuring dependent types, immutability, validation

## Design

    Possible convenience format for authoring multiple Point related functions.
    Drawback is that in a long list this imlicit argument may be off screen.
    (point: Point)
        let translate = (x: Number, y: Number) -> new Point(point.x + x, point.y + y)
        let rotate =->
    let (a: Number, b: Number)
        multiply = () => a * b
        add = () => a + b
    // if only numbers can have operators then we can infer types more effectively
    // in which case a shorter way to specify parameters is not as useful
    let multiply = (a, b) => a * b
    let divide = (a, b) => a / b
    let add = (a, b) => a + b
    let subtract = (a, b) => a - b

## TODO
    X add type guard on is<Type> functions
    X fix undefined in Point3
    X add types to constructor parameters
    X default values on struct parameters
    X struct parameters vs class parameters => constructor({x = 0, y = 0}: { x?: Whole, y?: Whole })
    X add is<Type> functions to classes for runtime type checking
    X add type guard to isClass functions
    X add Class.isClass functions with type guard.
    X figure out how to publish and consume ion
        decision use npmjs with ion prefix:
            ion.ion
            ion.sample
            ion.glass.graphics
    X publish compiler
    X use new ast
    X parsing
    X make instances immutable
    X Convert Traversal functions to be immutable / patch results.
    X Ion => add Implements Clauses to class definition.
    X Implement ImportResolution.
    X Create .patch function on instances
    X Need Readonly<Array<type>> to prevent modifying an elements arrays.
    X ReadonlySet
    X ReadonlyMap
    X Merge Bootstrapped into main.
    X extend Object
    X toString
    X implement static fields (was typescript.. only, should be generic)
    X migrate other properties to static for runtime type checking.
    X Normalize Type Declarations
    X Fix bug where Vector.toString is not using right referenced type.
    X Normalize identifiers to safe for language (general solution)
    X Then actually extend Object for .toString
    X Add Implicit ReturnStatement within functions.
    - Do we allow numeric style operations on other classes like Vectors etc?
      Perform Basic Type Inference.
    X Finalize Initial Type System Design.
    X Generate 'this' in class variable functions that reference it.
      Handle 'this' in exported functions.
    X Add implicit 'this.' values for references to instance variables.
    X Implement "getters" for let variables.
    X Remove "let" variables from constructor and patch.
      Constant "let" declarations should be defined in Object.defineProperties(Class.prototype, { ... })
    X Migrate Runtime checks to use above format.
    -   Next step is to add a way to define static variables... on classes?
    X   Or else just remove the _implements and leave the id value and use that.
    X Remove old types
    X Use new types
      Convert class variables to use a named Map.
      Infer Types, Keep it going, infer them all.
      toCodeString function memoize