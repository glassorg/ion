# ion
High performance functional language targeting web assembly with strong typescript interop.

## Type Refactoring

Type
    ValueType
        CompositeType
        ConstrainedType
        TypeReference
        StructDeclaration
    FunctionType        //  not a runtime type
    MultifunctionType   //  not a runtime type
    TypeofExpression    //  not a runtime type

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
[ ] Let's allow checking types dependent upon other parameters values.
[ ] Verify with array bounds checking.
