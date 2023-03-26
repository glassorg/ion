# ion
High performance functional language targeting web assembly with strong typescript interop.

## TODO
[x] Type Expressions to AST format.
[x] Use Kype to calculate +(Integer, Integer)
[x] Finish the interval merging in simplification.
[x] Fix parameter declarations being in scope.
[x] Simplify (!= 0 | 1) => != 0
[x] Check that function resolved return type actually matches declared return type.
[x] Make ranges for iterating loops.
[x] Check type on variable assignment.
    [x] Works correctly with Variables outside of a for loop. 
[x] Resolve native functions normally and make sure they are finished being resolved.
[x] Add support for structure types.
[ ] Add structure constructor rules with optional named fields.
[ ] Test that every expression is fully resolved.

[ ] Need ability to declare variables without 'let'
[x] Need syntax for TypeExpressions { x: > 0, y: < 10 }
[x] Need getMember to account for type constraints in addition to the baseType field.
[x] Need to resolve TypeExpressions with a TypeExpression base type to a combined TypeExpression.

TODO

    THIS IS WRONG

            phi `b:18:5` : {typeof `b:18:1` | typeof `b:18:2`};
            phi `b:18:5` :: Integer{(. >= -2),(. <= 0),(. >= 1),(. <= 1)};