import { strict as assert } from "assert";
import { ISONDebug } from "../ast/AstSerializers";
import { createParser } from "./createParser";

const parser = createParser();

function testParseExpression(source: string, expectedJSON: any) {
    const filename = "test";
    parser.setSource(filename, source);
    const expression = parser.parseNode();
    const json = JSON.parse(ISONDebug.stringify(expression));
    if (ISONDebug.stringify(expectedJSON) !== ISONDebug.stringify(json)) {
        console.log(ISONDebug.stringify(json));
    }
    assert.deepEqual(json, expectedJSON);
}

testParseExpression(`a = 1`, {
    "": "AssignmentExpression",
    "left": {
        "": "Reference",
        "name": "a"
    },
    "operator": "=",
    "right": {
        "": "IntegerLiteral",
        "value": "1"
    }
});

testParseExpression(`a + 1`, {
    "": "CallExpression",
    "callee": {
        "": "Reference",
        "name": "+"
    },
    "args": [
        {
            "": "Reference",
            "name": "a"
        },
        {
            "": "IntegerLiteral",
            "value": "1"
        }
    ]
});

testParseExpression(`a || 1`, {
    "": "LogicalExpression",
    "left": {
        "": "Reference",
        "name": "a"
    },
    "operator": "||",
    "right": {
        "": "IntegerLiteral",
        "value": "1"
    }
});

testParseExpression(`a()`, {
    "": "CallExpression",
    "callee": {
        "": "Reference",
        "name": "a"
    },
    "args": []
});

testParseExpression(`a(b)`, {
    "": "CallExpression",
    "callee": {
        "": "Reference",
        "name": "a"
    },
    "args": [
        {
            "": "Reference",
            "name": "b"
        }
    ]
});

testParseExpression(`a(b, c)`, {
    "": "CallExpression",
    "callee": {
        "": "Reference",
        "name": "a"
    },
    "args": [
        {
            "": "Reference",
            "name": "b"
        },
        {
            "": "Reference",
            "name": "c"
        }
    ]
});

testParseExpression(`a.b`, {
    "": "MemberExpression",
    "object": {
        "": "Reference",
        "name": "a"
    },
    "property": {
        "": "Identifier",
        "name": "b"
    }
});

testParseExpression(`a.b.c`, {
    "": "MemberExpression",
    "object": {
        "": "MemberExpression",
        "object": {
            "": "Reference",
            "name": "a"
        },
        "property": {
            "": "Identifier",
            "name": "b"
        }
    },
    "property": {
        "": "Identifier",
        "name": "c"
    }
});

testParseExpression(`a[b]`, {
    "": "IndexExpression",
    "object": {
        "": "Reference",
        "name": "a"
    },
    "index": {
        "": "Reference",
        "name": "b"
    }
});

testParseExpression(
    `
if foo
    bar
`, {
    "": "IfStatement",
    "test": {
        "": "Reference",
        "name": "foo"
    },
    "consequent": {
        "": "BlockStatement",
        "statements": [
            {
                "": "ExpressionStatement",
                "expression": {
                    "": "Reference",
                    "name": "bar"
                }
            }
        ]
    }
});

testParseExpression(
    `if foo
    bar
else
    baz
    fuz
`, {
    "": "IfStatement",
    "test": {
        "": "Reference",
        "name": "foo"
    },
    "consequent": {
        "": "BlockStatement",
        "statements": [
            {
                "": "ExpressionStatement",
                "expression": {
                    "": "Reference",
                    "name": "bar"
                }
            }
        ]
    },
    "alternate": {
        "": "BlockStatement",
        "statements": [
            {
                "": "ExpressionStatement",
                "expression": {
                    "": "Reference",
                    "name": "baz"
                }
            },
            {
                "": "ExpressionStatement",
                "expression": {
                    "": "Reference",
                    "name": "fuz"
                }
            }
        ]
    }
})

testParseExpression(
    `if foo
    a
else if bar
    b
else
    c
`, {
    "": "IfStatement",
    "test": {
        "": "Reference",
        "name": "foo"
    },
    "consequent": {
        "": "BlockStatement",
        "statements": [
            {
                "": "ExpressionStatement",
                "expression": {
                    "": "Reference",
                    "name": "a"
                }
            }
        ]
    },
    "alternate": {
        "": "IfStatement",
        "test": {
            "": "Reference",
            "name": "bar"
        },
        "consequent": {
            "": "BlockStatement",
            "statements": [
                {
                    "": "ExpressionStatement",
                    "expression": {
                        "": "Reference",
                        "name": "b"
                    }
                }
            ]
        },
        "alternate": {
            "": "BlockStatement",
            "statements": [
                {
                    "": "ExpressionStatement",
                    "expression": {
                        "": "Reference",
                        "name": "c"
                    }
                }
            ]
        }
    }
});

testParseExpression(`var x: Number = 10`, {
    "": "VariableDeclaration",
    "id": {
        "": "Declarator",
        "name": "x"
    },
    "declaredType": {
        "": "ComparisonExpression",
        "left": {
            "": "DotExpression"
        },
        "operator": "is",
        "right": {
            "": "Reference",
            "name": "Number"
        }
    },
    "meta": [],
    "defaultValue": {
        "": "IntegerLiteral",
        "value": "10"
    }
});

testParseExpression(`let x = 20`, {
    "": "ConstantDeclaration",
    "id": {
        "": "Declarator",
        "name": "x"
    },
    "meta": [],
    "value": {
        "": "IntegerLiteral",
        "value": "20"
    }
});

testParseExpression(`type Foo = Bar | Baz & Buz`, {
    "": "TypeDeclaration",
    "id": {
        "": "Declarator",
        "name": "Foo"
    },
    "meta": [],
    "type": {
        "": "LogicalExpression",
        "left": {
            "": "ComparisonExpression",
            "left": {
                "": "DotExpression"
            },
            "operator": "is",
            "right": {
                "": "Reference",
                "name": "Bar"
            }
        },
        "operator": "||",
        "right": {
            "": "LogicalExpression",
            "left": {
                "": "ComparisonExpression",
                "left": {
                    "": "DotExpression"
                },
                "operator": "is",
                "right": {
                    "": "Reference",
                    "name": "Baz"
                }
            },
            "operator": "&&",
            "right": {
                "": "ComparisonExpression",
                "left": {
                    "": "DotExpression"
                },
                "operator": "is",
                "right": {
                    "": "Reference",
                    "name": "Buz"
                }
            }
        }
    }
});

testParseExpression(
    `
for x in foo
    x + bar
`, {
    "": "ForStatement",
    "statements": [
        {
            "": "ForVariantDeclaration",
            "id": {
                "": "Declarator",
                "name": "x"
            },
            "meta": []
        },
        {
            "": "BlockStatement",
            "statements": [
                {
                    "": "ExpressionStatement",
                    "expression": {
                        "": "CallExpression",
                        "callee": {
                            "": "Reference",
                            "name": "+"
                        },
                        "args": [
                            {
                                "": "Reference",
                                "name": "x"
                            },
                            {
                                "": "Reference",
                                "name": "bar"
                            }
                        ]
                    }
                }
            ]
        }
    ],
    "right": {
        "": "Reference",
        "name": "foo"
    }
});

testParseExpression(
    `function add(x: Number = 0, y: Number = 0)
    return x
`, {
    "": "FunctionDeclaration",
    "id": {
        "": "Declarator",
        "name": "add"
    },
    "meta": [],
    "value": {
        "": "FunctionExpression",
        "parameters": [
            {
                "": "ParameterDeclaration",
                "id": {
                    "": "Declarator",
                    "name": "x"
                },
                "declaredType": {
                    "": "ComparisonExpression",
                    "left": {
                        "": "DotExpression"
                    },
                    "operator": "is",
                    "right": {
                        "": "Reference",
                        "name": "Number"
                    }
                },
                "meta": [],
                "defaultValue": {
                    "": "IntegerLiteral",
                    "value": "0"
                }
            },
            {
                "": "ParameterDeclaration",
                "id": {
                    "": "Declarator",
                    "name": "y"
                },
                "declaredType": {
                    "": "ComparisonExpression",
                    "left": {
                        "": "DotExpression"
                    },
                    "operator": "is",
                    "right": {
                        "": "Reference",
                        "name": "Number"
                    }
                },
                "meta": [],
                "defaultValue": {
                    "": "IntegerLiteral",
                    "value": "0"
                }
            }
        ],
        "body": {
            "": "BlockStatement",
            "statements": [
                {
                    "": "ReturnStatement",
                    "argument": {
                        "": "Reference",
                        "name": "x"
                    }
                }
            ]
        }
    }
});

testParseExpression(
    `class Foo`, {
    "": "ClassDeclaration",
    "id": {
        "": "Declarator",
        "name": "Foo"
    },
    "meta": [],
    "fields": []
});

testParseExpression(
    `
class Foo
`, {
    "": "ClassDeclaration",
    "id": {
        "": "Declarator",
        "name": "Foo"
    },
    "meta": [],
    "fields": []
});

testParseExpression(
    `
class Vector
    x: Number
    y: Number
    z: Number = 0
`, {
    "": "ClassDeclaration",
    "id": {
        "": "Declarator",
        "name": "Vector"
    },
    "meta": [],
    "fields": [
        {
            "": "FieldDeclaration",
            "id": {
                "": "Declarator",
                "name": "x"
            },
            "declaredType": {
                "": "ComparisonExpression",
                "left": {
                    "": "DotExpression"
                },
                "operator": "is",
                "right": {
                    "": "Reference",
                    "name": "Number"
                }
            },
            "meta": []
        },
        {
            "": "FieldDeclaration",
            "id": {
                "": "Declarator",
                "name": "y"
            },
            "declaredType": {
                "": "ComparisonExpression",
                "left": {
                    "": "DotExpression"
                },
                "operator": "is",
                "right": {
                    "": "Reference",
                    "name": "Number"
                }
            },
            "meta": []
        },
        {
            "": "FieldDeclaration",
            "id": {
                "": "Declarator",
                "name": "z"
            },
            "declaredType": {
                "": "ComparisonExpression",
                "left": {
                    "": "DotExpression"
                },
                "operator": "is",
                "right": {
                    "": "Reference",
                    "name": "Number"
                }
            },
            "meta": [],
            "defaultValue": {
                "": "IntegerLiteral",
                "value": "0"
            }
        }
    ]
}
);

testParseExpression(
    `
struct Foo
`, {
    "": "StructDeclaration",
    "id": {
        "": "Declarator",
        "name": "Foo"
    },
    "meta": [],
    "fields": []
});

testParseExpression(
    `
struct Vector
    x: Number = 0
    y: Number = 0
`, {
    "": "StructDeclaration",
    "id": {
        "": "Declarator",
        "name": "Vector"
    },
    "meta": [],
    "fields": [
        {
            "": "FieldDeclaration",
            "id": {
                "": "Declarator",
                "name": "x"
            },
            "declaredType": {
                "": "ComparisonExpression",
                "left": {
                    "": "DotExpression"
                },
                "operator": "is",
                "right": {
                    "": "Reference",
                    "name": "Number"
                }
            },
            "meta": [],
            "defaultValue": {
                "": "IntegerLiteral",
                "value": "0"
            }
        },
        {
            "": "FieldDeclaration",
            "id": {
                "": "Declarator",
                "name": "y"
            },
            "declaredType": {
                "": "ComparisonExpression",
                "left": {
                    "": "DotExpression"
                },
                "operator": "is",
                "right": {
                    "": "Reference",
                    "name": "Number"
                }
            },
            "meta": [],
            "defaultValue": {
                "": "IntegerLiteral",
                "value": "0"
            }
        }
    ]
});

testParseExpression(`x += 10`, {
    "": "AssignmentExpression",
    "left": {
        "": "Reference",
        "name": "x"
    },
    "operator": "=",
    "right": {
        "": "CallExpression",
        "callee": {
            "": "Reference",
            "name": "+"
        },
        "args": [
            {
                "": "Reference",
                "name": "x"
            },
            {
                "": "IntegerLiteral",
                "value": "10"
            }
        ]
    }
});

testParseExpression(`!x`, {
    "": "UnaryExpression",
    "operator": "!",
    "argument": {
        "": "Reference",
        "name": "x"
    }
});

testParseExpression("x <= y", {
    "": "ComparisonExpression",
    "left": {
        "": "Reference",
        "name": "x"
    },
    "operator": "<=",
    "right": {
        "": "Reference",
        "name": "y"
    }
});

testParseExpression(`(a: Integer): Integer => a`, {
    "": "FunctionExpression",
    "parameters": [
        {
            "": "ParameterDeclaration",
            "id": {
                "": "Declarator",
                "name": "a"
            },
            "declaredType": {
                "": "ComparisonExpression",
                "left": {
                    "": "DotExpression"
                },
                "operator": "is",
                "right": {
                    "": "Reference",
                    "name": "Integer"
                }
            },
            "meta": []
        }
    ],
    "body": {
        "": "BlockStatement",
        "statements": [
            {
                "": "ExpressionStatement",
                "expression": {
                    "": "Reference",
                    "name": "a"
                }
            }
        ]
    }
})

testParseExpression(
    `function sample()
    return 1 + 2
`, {
    "": "FunctionDeclaration",
    "id": {
        "": "Declarator",
        "name": "sample"
    },
    "meta": [],
    "value": {
        "": "FunctionExpression",
        "parameters": [],
        "body": {
            "": "BlockStatement",
            "statements": [
                {
                    "": "ReturnStatement",
                    "argument": {
                        "": "CallExpression",
                        "callee": {
                            "": "Reference",
                            "name": "+"
                        },
                        "args": [
                            {
                                "": "IntegerLiteral",
                                "value": "1"
                            },
                            {
                                "": "IntegerLiteral",
                                "value": "2"
                            }
                        ]
                    }
                }
            ]
        }
    }
});