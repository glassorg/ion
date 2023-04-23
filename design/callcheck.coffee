//  array get function
//  convert to call site required pre-conditions
//      @arg0 is Array
//      @arg1 is Integer
//      @arg1 >= 0
//      @arg1 < @arg0.length
get = (array: Array, index: >= 0 & < array.length)

copyIterateFromCheckTo = (from: Float[], to: Float[]) ->
    //  from: Array<Float>
    //  to: Array<Float>
    for i in 0 .. < from.length
        //  i: Integer{ @ >= 0, @ < from.length }
        if i < to.length
            //  i: Integer{ @ >= 0, @ < from.length, @ < to.length }
            //  convert to known propositions
            //      @arg0 is Array
            //      @arg1 is Integer
            //      @arg1 >= 0
            //      @arg1 < @arg0.length
            //      @arg1 < to.length
            value = get(from, i)
            //  convert to known propositions
            //      @arg0 is Array
            //      @arg1 is Integer
            //      @arg1 >= 0
            //      @arg1 < from.length
            //      @arg1 < @arg0.length
            set(to, i, value)
    return to

copyIterateFrom = (from: Float[], to: Float[]{ @.length == from.length }) ->
    //  from: Array<Float>{ @.length == to.length }
    //  to: Array<Float>{ @.length == from.length }
    for i in 0 .. < from.length
        //  i: Integer{ @ >= 0, @ < from.length }
        //  convert to known propositions
        //      @arg0 is Array
        //      @arg1 is Integer
        //      @arg1 >= 0
        //      @arg1 < @arg0.length
        value = get(from, i)
        //  convert to known propositions
        //      @arg0 is Array
        //      @arg0.length == from.length
        //      @arg1 is Integer
        //      @arg1 >= 0
        //      @arg1 < from.length
        set(to, i, value)
    return to

copyIterateTo = (from: Float[], to: Float[]{ @.length == from.length }) ->
    //  from: Array<Float>{ @.length == to.length }
    //  to: Array<Float>{ @.length == from.length }
    for i in 0 .. < to.length   //  unlike copy3, now we are iterating to to.length
        //  i: Integer{ @ >= 0, @ < to.length }
        //  convert to known propositions
        //      @arg0 is Array
        //      @arg1 is Integer
        //      @arg1 >= 0
        //      @arg1 < to.length
        //  "to" is referenced here, so we need to bring in propositions related to "to"
        //      to is Array
        //      to.length == @arg0.length
        value = get(from, i)
    return to

readLiteralArray = () ->
    //  [0, 1, 2] : Array<Float>{ @.length == 3 }
    //  convert to known propositions
    //      @arg0 is Array
    //      @arg0.length == 3
    //      @arg1 is Integer
    //      @arg1 == 2
    return get([0, 1, 2], 2)

