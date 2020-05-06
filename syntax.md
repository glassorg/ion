
# [X] inline function signature

    let add = (a: Number = 0, b: Number = 0): Number => a + b
    let add = (a = 0, b = 0) => a + b
    let add = (a, b) => a + b

# [X] inline/outline function signature

    let add = (a = 0, b = 0) =>
        if a < 0
            a + b
        else
            a - b

# [ ] outline function signature

    let add =
        ()
            a = 0
            b = 0
        =>
            a + b

# [X] outline if else

    if expression
        consequent

    if expression
        consequent
    else
        alternate

    if expression
        consequent
    else if expression
        alternate
    else
        default
