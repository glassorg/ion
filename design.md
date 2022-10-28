
    let position = new Vector(3, 4, 5)
    let position = Vector(3, 4, 5)
    let position = 3, 4, 5
    let position: Vector = 3, 4, 5

    let normal = Vector(1, 2, 3)
    let direction = Vector(4, 5, 6)
    let value = normal.dot(direction)

    class Vector3
        var x: Number
        var y: Number
        var z: Number

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
