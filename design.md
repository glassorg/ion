
[x]   AstNode
[x]       Expression
[x]           BinaryExpression            x * y
[x]               LogicalExpression       x || y      x && y
[x]               ComparisonExpression    x <= y      x == y
[x]               AssignmentExpression    x = 12      x += 20
[x]           UnaryExpression             !x
[x]           CallExpression              foo(1, 2)
[x]           MemberExpression            foo.bar
[x]           IndexExpression             foo[bar]
[x]       Statement
[x]           BlockStatement              (indented four spaces)
[x]           ExpressionStatement         (only valid with AssignmentExpression)
[x]           ForStatement                for x in array ForStatement extends BlockStatement
[x]           IfStatement                 if test
[x]           Declaration
[x]               VariableDeclaration     var x: Number = 12
[x]               ParameterDeclaration    x: Number = 12
[x]               ConstantDeclaration     let x = 20
[x]               TypeDeclaration         type Foo = Bar | Baz
[x]               ForVariantDeclaration   for x: 0 .. 10
[x]               FieldDeclaration        x: Number = 12
[x]               FunctionDeclaration     function double(a: Float) => a * 2
[x]               ClassDeclaration        class MetaClass
[x]               StructDeclaration       struct Vector

                                id      value   valueType   type    defaultValue
Declaration                     1
  AbstractValueDeclaration      1               1
     VariableDeclaration        1               1                   1
        ParameterDeclaration    1               1                   1
        FieldDeclaration        1               1                   1
     ForVariantDeclaration      1               1
     ConstantDeclaration        1       1       1
     FunctionDeclaration        1       1       1
  AbstractTypeDeclaration       1                           A
    TypeDeclaration             1                           1
    StructDeclaration           1                           1
      ClassDeclaration          1                           1

## inline function signature

    function add(a = 0, b = 0) => a + b

## outline function signature

    function add(
        a = 0
        b = 0
    ) =>
        a + b

## outline function call

    Vector(
        this.x * b.y
        this.y * b.z
        this.z * b.x
    )

## inline function call

    Vector(this.x * b.y, this.y * b.z, this.z * b.x)

## outline if else

    if expression
        consequent
    else
        alternate

## outline for

    for value in array
    for value in set
    for [key, value] in map

## array comprehensions? Not yet.

    [0 .. 100]

# External References

Every module level declaration has an absolute path.

/path/to/File#File  => path.to.File
/path/to/File#foo   => path.to.File.foo
/path/to/File#bar   => path.to.File.bar

How do we know what the root is from a compilation pov? If find a package.json?

# Phases

## Parsing

```typescript
type AbsolutePath = string
interface ParseResult {
    declaration?: Declaration;
    possibleExternals: AbsolutePath[];
    errors: SemanticError[];
}
function parse(filename: string, loader): ParseResult[] {
}
//  each Declaration should be semantically checked internally
```

# Multiple Declarations?

Functions can be overloaded with multiple declarations.
Can only be contained within the same name.
Let's imagine operator overloading for Vectors.

```typescript
Integer.+ = (a: Integer, b: Integer): Integer => @Native()
Float.+.1 = (a: Float, b: Float): Float => @Native()
Float.+.2 = (a: Float, b: Integer): Float => @Native()
Float.+.3 = (a: Integer, b: Float): Float => @Native()

function `+`
    (a: Integer, b: Integer): Integer => @Native()
    (a: Float, b: Float): Float => @Native()
    (a: Integer, b: Float): Float => @Native()
    (a: Float, b: Integer): Float => @Native()

class Vector
    x: Float
    y: Float
Vector.+ = (a: Vector2, b: Vector2): Vector2 => Vector2(a.x + b.x, a.y + b.y)

```

```typescript

//  Integer.ion
function add(a: Integer, b: Integer) => @Native()

//  foo.Vector.ion
function add
    (a: Integer, b: Vector) => Vector(b.x + a, b.y + a, b.z + a)
    (a: Vector, b: Integer) => b + a

//  foo.bar.baz.ion
let sum1 = foo.Vector.add(1, Vector(2, 3, 4))
let sum2 = add(1, Vector(2, 3, 4))

//  hmmm, we NEVER need to reference functions directly
//  IF their signatures must be unique anyways.

```

## Decision on namespace scoping

Functions are always defined in a global namespace.
They can be overloaded with the following limitations:
For two functions with the same name
    A(...AIn) => AOut
    B(...BIn) => BOut

    AIn.isSubClassOf(BIn), BIn.isSubClassOf(AIn)
    --------------------------------------------
    true, true  => Error: Duplicate signatures.
    null, null  => Error: Ambiguous overloads, not clear which should come first.
    true, null  => OK, sort A before B. Check Compatible Outputs.
                    AOut.isSubClassOf(BOut) must be true
    null, true  => OK, sort B before A. Check Compatible Outputs.
                    BOut.isSubClassOf(AOut) must be true
    false, false  => OK, sort order is irrelevant as overlap is impossible.
    true, false => Impossible.
    false, true => Impossible.
    false, null => Impossible.
    null, false => Impossible.

## Type AST

type Type = TypeConstraint // dot > 0 && dot < 10 && dot is Integer
          | FunctionType
          | MultiFunctionType

AstNode
    -> Token
    -> Resolvable
        resolved: boolean
        -> Expression
        -> Type
        -> Statement
            -> Declaration

## Compilation Structure

    src/
        foo.ts      //  call directly into bar using bar.d.ts types
        bar.ion     //  ion source code
        bar.d.ts    //  generated by our compiler, checked in
    lib/
        bar.js      //  generated by our compiler: javascript bindings 
        bar.wasm    //  generated by our compiler.

