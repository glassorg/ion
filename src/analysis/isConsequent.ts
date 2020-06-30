import { memoize } from "../common";
import { Expression, BinaryExpression, Literal } from "../ast";
import { maxHeaderSize } from "http";
import toCodeString from "../toCodeString";

//  a < 10
//  a < 20
//  ifFirstIsTrueIsSecondTrue => true

//  a < 10
//  a > 10
//  ifFirstIsTrueIsSecondTrue => false

//  a < 10
//  a >= 10
//  ifFirstIsTrueIsSecondTrue => null  // maybe?

//  harder with more complicated expressions...
//  a < 10 && a > 5
//  a < 8 && a > 3
//  .... that's what I'm figuring out now.

type Maybe = true | false | null
//  a  \  b |  true   false   null
//  --------------------------------
//  true    |  true   true    true
//  false   |  true   false   null
//  null    |  true   null    null
function max(a: Maybe, b: Maybe): Maybe {
    if (a === true || b === true)
        return true
    if (a == null || b == null)
        return null
    return false
}
//  a  /  b |  true   false   null
//  --------------------------------
//  true    |  true   false   null
//  false   |  false  false   false
//  null    |  null   false   null
function min(a: Maybe, b: Maybe): Maybe {
    if (a === false || b === false)
        return false
    if (a == null || b == null)
        return null
    return true
}
//  a  \  b |  true   false   null
//  --------------------------------
//  true    |  true   null    null
//  false   |  null   false   null
//  null    |  null   null    null
function same(a: Maybe, b: Maybe): Maybe {
    return a === b ? a : null
}

/**
 * Assuming expression 'a' is true then this function returns
 * true if 'b' is necessarily true
 * false if 'b' is necessarily false
 * null if we cannot determine
 */
export default function isConsequent(a: Expression, b: Expression): true | false | null {
    if (toCodeString(a) === toCodeString(b)) {
        return true
    }
    if (BinaryExpression.is(a)) {
        if (BinaryExpression.is(b)) {
            if (toCodeString(a.left) === toCodeString(b.left)) {
                if (Literal.is(a.right) && Literal.is(b.right)) {
                    let ar = a.right.value!
                    let br = b.right.value!
                    switch (a.operator) {
                        case '>': switch (b.operator) {
                            case '>=':                                  // > 0 is >= 0, > 1 is >= 0
                            case '>':  return ar >= br ? true : null    // > 0 is > 0, > 1 is > 0
                            case '<=':                                  // > 0 isnt <= 0, > 1 isnt <= 0
                            case '==':                                  // > 0 isnt == 0, > 1 isnt == 0
                            case '<':  return ar >= br ? false : null   // > 0 isnt < 0, > 1 isnt < 0
                        }
                        case '>=': switch (b.operator) {
                            case '>=':                                  // >= 1 is >= 0
                            case '>':  return ar > br ?  true : null    // >= 1 is > 0
                            case '==':                                  // >= 1 isnt == 0
                            case '<=': return ar > br ? false : null    // >= 1 isnt <= 0
                            case '<':  return ar >= br ? false : null   // >= 0 isnt < 0, >= 1 isnt < 0
                        }
                        case '<': switch (b.operator) {
                            case '<=':                                  // < 0 is <= 0, < -1 is <= 0
                            case '<':  return ar <= br ?  true : null   // < 0 is < 0, < -1 is < 0
                            case '>=':                                  // < 0 isnt >= 0, < -1 isnt >= 0
                            case '==':                                  // < 0 isnt == 0, < -1 isnt == 0
                            case '>':  return ar <= br ? false : null   // < 0 isnt > 0, < -1 isnt > 0
                        }
                        case '<=': switch (b.operator) {
                            case '<=':                                  // <= -1 is <= 0
                            case '<':  return ar < br ?  true : null    // <= -1 is < 0
                            case '==':                                  // <= -1 isnt == 0
                            case '>=': return ar < br ? false : null    // <= -1 isnt >= 0
                            case '>':  return ar <= br ? false : null   // <= 0 isnt > 0, <= -1 isnt > 0
                        }
                        case '==': switch (b.operator) {
                            case '<=': return ar <= br      // == 0 is <= 0, == 0 is <= 1
                            case '<': return ar < br        // == 0 is < 1
                            case '==': return ar === br     // == 0 is == 0
                            case '>=': return ar >= br      // == 0 is >= 0
                            case '>':  return ar > br       // == 0 is > -1
                            case '!=': return ar != br      // == 0 is != 1
                        }
                    }
                }
                else if (toCodeString(a.right) === toCodeString(b.right)) {
                    // we can still analyze some comparisons if we know the both right hand operators are the same.
                    switch (a.operator) {
                        case '>': switch (b.operator) {
                            case '<': case '<=': case '==': return false
                        }
                        case '>=': switch (b.operator) {
                            case '<': return false
                        }
                        case '<': switch (b.operator) {
                            case '>': case '>=': case '==': return false
                        }
                        case '<=': switch (b.operator) {
                            case '>': return false
                        }
                        case '==': switch (b.operator) {
                            case '>': case '<': case '!=': return false
                        }
                        case '!=': switch (b.operator) {
                            case '==': return false
                        }
                        case 'is': switch (b.operator) {
                            case 'isnt': return false
                        }
                        case 'isnt': switch (b.operator) {
                            case 'is': return false
                        }
                    }
                }
            }
            switch (b.operator) {
                case "&":
                    return min(isConsequent(a, b.left), isConsequent(a, b.right))
                case "|":
                    return max(isConsequent(a, b.left), isConsequent(a, b.right))
            }
            switch (a.operator) {
                case "&":
                    return max(isConsequent(a.left, b), isConsequent(a.right, b))
                case "|":
                    return same(isConsequent(a.left, b), isConsequent(a.right, b))
            }
        }
    }
    return null
}