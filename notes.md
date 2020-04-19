
Do we need let and var declarations at all?
    They aren't needed for static or instance variables.
    Only potentially needed in functions.
    If every instance is immutable... then we can only potentially reassign variables
    
TODO:
    X Create unified, strongly typed Root compilation Node.
    X  The entire pipeline should only need to refer to it, consistently.
    X  No other parameters.
    X  Simplify the compilation phases once again.
