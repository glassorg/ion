What is a Type?

A Class and zero or more constraints on it's properties.
```javascript

//  We can define types as predicate functions

Integer(_) => _.class == Integer
Positive(_) => _ > 0
Negative(_) => _ < 0
Zero(_) => _ == 0
NonZero(_) => Positive(_) || Negative(_)

//  Leaving the _ as implied

Integer =       .class == Integer
Positive =      > 0
Negative =      < 0
Zero =          == 0
NonZero =       Positive || Negative
Even =          % 2 == 0
Odd =           ! Even

//  How would you do dependent types
function concatenate(a: Array, b: Array): Array{ length: a.length + b.length }
//  do we have to be able to declare the shape of the types in the language itself?

class Vector2
    x: Integer
    y: Integer

function Prime(value: Integer)
    return false

//  Array
Integer[]{ length == 2 }    =>  Array<Integer>{ .length == 2 }
//  Tuple
[Integer, Float]    => Array<Integer | Float>{ .[0] is Integer, .[1] is Float }
//  Instance
Vector2{ x > y, x < 10, y > 5 } => Vector2{ .x > .y, .x < 10, .y > 5 }
//  Primitive
Integer     => Integer{}
> 0         => Integer{ . > 0 }
> 0.0       => Float{ . > 0.0 }
0 .. 10     => Integer{ . >= 0, . < 10 }

```
