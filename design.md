
let position = new Vector(3, 4, 5)
let position = Vector(3, 4, 5)
let position = 3, 4, 5
let position: Vector = 3, 4, 5

let normal = Vector(1, 2, 3)
let direction = Vector(4, 5, 6)
let value = normal.dot(direction)

export
    class Vector3
        var x: Number
        var y: Number
        var z: Number

        # let function defined on class is shorthand for separate function
        let add = (v: Vector) => Vector(this.x + v.x, this.y + v.y, this.z + v.z)

# equivalent to class defined function above
let add = (this: Vector, v: Vector) => Vector(this.x + v.x, this.y + v.y, this.z + v.z)

# inline function signature
(b: Vector, c: Vector): Vector =>
# outline function signature
(
    b: Vector
    c: Vector
): Vector =>
    a + b

# outline function call
Vector
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

# inline if else
if expression then consequent else alternate
# or conditional
expression ? consequent : alternate

# outline while
while expression
    body
# inline while -> not allowed

# outline for
for value in array
for index, value in array
for value in set
for index, value in set
for value in map
for key, value in map
for index, key, value in map
