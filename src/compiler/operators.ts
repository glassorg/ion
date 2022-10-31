
export class Operator {

    public readonly precedence: number;
    public readonly allowOutline: boolean;
    public readonly overridable: boolean;
    public readonly rightAssociative: boolean;
    public readonly prefixAmbiguous: boolean;

    constructor(
        precedence: number,
        options?: {
            allowOutline?: boolean,
            overridable?: boolean,
            rightAssociative?: boolean,
            prefixAmbiguous?: boolean,
        }
    ){
        this.precedence = precedence;
        this.allowOutline = options?.allowOutline ?? false;
        this.overridable = options?.overridable ?? false;
        this.rightAssociative = options?.rightAssociative ?? false;
        this.prefixAmbiguous = options?.prefixAmbiguous ?? false;
    }
}

export const PrefixOperators = {
    "(": new Operator(19),
    "+": new Operator(14),
    "-": new Operator(14, { prefixAmbiguous: true }),
    "!": new Operator(14),
    "~": new Operator(14),
    "<": new Operator(14),    //  used for numeric types: < 10
    "<=": new Operator(14),   //  used for numeric types: <= 10
    ">": new Operator(14),    //  used for numeric types: > 10
    ">=": new Operator(14),   //  used for numeric types: >= 10
    "!=": new Operator(14),   //  used for numeric types: != 10
    "void": new Operator(2),
    "typeof": new Operator(2),
} as const;

export type PrefixOperator = keyof typeof PrefixOperators;

export const InfixOperators = {
    "[": new Operator(19),    //  ]
    ".": new Operator(19),
    "(": new Operator(19),    //  )
    "**": new Operator(17, { overridable: true, rightAssociative: true }),
    "*": new Operator(16, { overridable: true }),
    "/": new Operator(16, { overridable: true }),
    "%": new Operator(16, { overridable: true }),
    "<<": new Operator(15, { overridable: true }),
    ">>": new Operator(15, { overridable: true }),
    //  default unknown operator precedence
    "+": new Operator(14, { overridable: true }),
    "-": new Operator(14, { overridable: true }),
    "&": new Operator(12, { overridable: true }),
    "^": new Operator(11, { overridable: true }),
    "|": new Operator(10, { overridable: true }),
    "<": new Operator(9),    //  not overridable
    "<=": new Operator(9),   //  not overridable
    ">": new Operator(9),    //  not overridable
    ">=": new Operator(9),   //  not overridable
    "is": new Operator(9),    //  not overridable
    "==": new Operator(8),   //  not overridable
    "!=": new Operator(8),   //  not overridable
    "..": new Operator(8),   //  not overridable
    "&&": new Operator(7),    //  not overridable
    "||": new Operator(6),    //  not overridable
    ":": new Operator(5),     //  not overridable
    "=>": new Operator(4, { allowOutline: true }),    //  not overridable
    "=": new Operator(3, { rightAssociative: true }),     //  not overridable
    ":=": new Operator(3),
    "+=": new Operator(3, { rightAssociative: true }),
    "-=": new Operator(3, { rightAssociative: true }),
    "**=": new Operator(3, { rightAssociative: true }),
    "*=": new Operator(3, { rightAssociative: true }),
    "/=": new Operator(3, { rightAssociative: true }),
    "%=": new Operator(3, { rightAssociative: true }),
    "<<=": new Operator(3, { rightAssociative: true }),
    ">>=": new Operator(3, { rightAssociative: true }),
    "^=": new Operator(3, { rightAssociative: true }),
    "&=": new Operator(3, { rightAssociative: true }),
    "|=": new Operator(3, { rightAssociative: true }),
    "&&=": new Operator(3, { rightAssociative: true }),
    "||=": new Operator(3, { rightAssociative: true }),
    ",": new Operator(1),
    ";": new Operator(1),
} as const;

export type InfixOperator = keyof typeof InfixOperators;
export type LogicalOperator = "||" | "&&";
export type AssignmentOperator = "=" | "+=" | "-=" | "**=" | "*=" | "/=" | "%=" | "<<=" | ">>=" | "^=" | "&=" | "|=" | "&&=" | "||=";

export function isPrefixOperator(operator: string): operator is PrefixOperator {
    return PrefixOperators[operator as PrefixOperator] != null;
}

export function isInfixOperator(operator: string): operator is InfixOperator {
    return InfixOperators[operator as InfixOperator] != null;
}

export function isOperator(operator: string): operator is (PrefixOperator | InfixOperator) {
    return isPrefixOperator(operator) || isInfixOperator(operator);
}

export function isLogicalOperator(operator: string): operator is LogicalOperator {
    return operator === "||" || operator === "&&";
}

export function isAssignmentOperator(operator: string): operator is AssignmentOperator {
    return InfixOperators[operator as InfixOperator] != null && operator.endsWith("=");
}
