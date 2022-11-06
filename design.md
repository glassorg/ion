
[-]   AstNode
[ ]       Interfaces
[x]       Expression
[x]           BinaryExpression            x * y
[x]               LogicalExpression       x || y      x && y
[x]               AssignmentExpression    x = 12      x += 20
[x]           CallExpression              foo(1, 2)
[x]           MemberExpression            foo.bar
[x]           IndexExpression             foo[bar]
[-]       Statement
[x]           BlockStatement              (indented four spaces)
[x]           ExpressionStatement         (only valid with AssignmentExpression)
[x]           ForStatement                for x in array ForStatement extends BlockStatement
[x]           IfStatement                 if test
[-]           Declaration
[x]               VariableDeclaration     var x: Number = 12
[x]               ParameterDeclaration    x: Number = 12
[x]               ConstantDeclaration     let x = 20
[x]               TypeDeclaration         type Foo = Bar | Baz
[x]               ForVariantDeclaration   for x: 0 .. 10
[x]               FieldDeclaration        x: Number = 12
[x]               FunctionDeclaration     function double(a: Float) => a * 2
[x]               ClassDeclaration        class MetaClass
[-]               StructDeclaration       struct Vector

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

    //  VariableDeclaration( writable: true ) : Declaration
    var x = 12
    //  VariableDeclaration( writable: false ) : Declaration
    let x = 12
    //  TypeDeclaration : Declaration
    type Foo = 10 .. 20

    //  AssignmentExpression : Expression
    x = 12

    //  only meta class for now.
    @Meta()
    //  ClassDeclaration : Declaration
    class Vector
        x: Number
        y: Number
        operator(x: Number, y: Number) => Vector(this.x + x, this.y + y)

    //  FunctionDeclaration
    function foo(a: Type, b: Type) =>
        if a is Bar
            return 12
        else
            //  ForStatement : Statement
            for i in 0 .. 20
                //  ReturnStatement: Statement
                return 20

    @Meta()
    @Bar()
    function fooWithMeta(
        @Meta(12)
        a: Type
        @Meta()
        b: Type
    ) =>
        return callOutline(
            12
            20
            30
        )

    let position = Vector(3, 4, 5)

    let normal = Vector(1, 2, 3)
    let direction = Vector(4, 5, 6)
    let value = normal.dot(direction)

    class Vector3
        x: Number
        y: Number
        z: Number

        # let function defined on class is shorthand for separate function
        add(v: Vector) => Vector(this.x + v.x, this.y + v.y, this.z + v.z)

# inline function signature

    function add(a = 0, b = 0) => a + b

# outline function signature

    function add(
        a = 0
        b = 0
    ) =>
        a + b

# outline function call

    Vector()
        this.x * b.y
        this.y * b.z
        this.z * b.x

# inline function call

    Vector(this.x * b.y, this.y * b.z, this.z * b.x)

# outline if else

    if expression
        consequent
    else
        alternate

# or conditional

    expression ? consequent : alternate

# outline for

    for value in array
    for value in set
    for [key, value] in map

# array comprehensions? Not yet.

    [0 .. 100]
