
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

/path/to/File#File  => #path.to.File
/path/to/File#foo   => #path.to.File.foo
/path/to/File#bar   => #path.to.File.bar

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


