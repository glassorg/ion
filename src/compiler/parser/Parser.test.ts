import { strict as assert } from "assert";
import { createParser } from "./createParser";

const parser = createParser();

function testParseExpression(source: string, expectedJSON: any) {
    parser.setSource("test", source);
    const expression = parser.parseNode();
    const json = JSON.parse(JSON.stringify(expression));
    if (JSON.stringify(expectedJSON) !== JSON.stringify(json)) {
        console.log(JSON.stringify(json, null, 4));
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
        "value": 1
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
            "value": 1
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
        "value": 1
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
    "valueType": {
        "": "Reference",
        "name": "Number"
    },
    "defaultValue": {
        "": "IntegerLiteral",
        "value": 10
    }
});

testParseExpression(`const x = 20`, {
    "": "ConstantDeclaration",
    "id": {
        "": "Declarator",
        "name": "x"
    },
    "value": {
        "": "IntegerLiteral",
        "value": 20
    }
});

// testParseExpression(`type Foo = Bar | Baz`, {
//     "": "TypeDeclaration",
//     "id": {
//         "": "Declarator",
//         "name": "Foo"
//     },
//     "type": {
//         "": "BinaryExpression",
//         "left": {
//             "": "Reference",
//             "name": "Bar"
//         },
//         "operator": "|",
//         "right": {
//             "": "Reference",
//             "name": "Baz"
//         }
//     }
// });

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
            }
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

testParseExpression(`function add(x: Number = 0, y: Number = 0) => x`, {
    "": "FunctionDeclaration",
    "id": {
        "": "Declarator",
        "name": "add"
    },
    "value": {
        "": "FunctionExpression",
        "parameters": [
            {
                "": "ParameterDeclaration",
                "id": {
                    "": "Declarator",
                    "name": "x"
                },
                "valueType": {
                    "": "Reference",
                    "name": "Number"
                },
                "defaultValue": {
                    "": "IntegerLiteral",
                    "value": 0
                }
            },
            {
                "": "ParameterDeclaration",
                "id": {
                    "": "Declarator",
                    "name": "y"
                },
                "valueType": {
                    "": "Reference",
                    "name": "Number"
                },
                "defaultValue": {
                    "": "IntegerLiteral",
                    "value": 0
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
`function second(x: Number = 0, y: Number = 0) =>
    return y
`, {
    "": "FunctionDeclaration",
    "id": {
        "": "Declarator",
        "name": "second"
    },
    "value": {
        "": "FunctionExpression",
        "parameters": [
            {
                "": "ParameterDeclaration",
                "id": {
                    "": "Declarator",
                    "name": "x"
                },
                "valueType": {
                    "": "Reference",
                    "name": "Number"
                },
                "defaultValue": {
                    "": "IntegerLiteral",
                    "value": 0
                }
            },
            {
                "": "ParameterDeclaration",
                "id": {
                    "": "Declarator",
                    "name": "y"
                },
                "valueType": {
                    "": "Reference",
                    "name": "Number"
                },
                "defaultValue": {
                    "": "IntegerLiteral",
                    "value": 0
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
                        "name": "y"
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
    "fields": [
        {
            "": "FieldDeclaration",
            "id": {
                "": "Declarator",
                "name": "x"
            },
            "valueType": {
                "": "Reference",
                "name": "Number"
            }
        },
        {
            "": "FieldDeclaration",
            "id": {
                "": "Declarator",
                "name": "y"
            },
            "valueType": {
                "": "Reference",
                "name": "Number"
            }
        },
        {
            "": "FieldDeclaration",
            "id": {
                "": "Declarator",
                "name": "z"
            },
            "valueType": {
                "": "Reference",
                "name": "Number"
            },
            "defaultValue": {
                "": "IntegerLiteral",
                "value": 0
            }
        }
    ]
});

testParseExpression(
`
struct Foo
`, {
    "": "StructDeclaration",
    "id": {
        "": "Declarator",
        "name": "Foo"
    },
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
    "fields": [
        {
            "": "FieldDeclaration",
            "id": {
                "": "Declarator",
                "name": "x"
            },
            "valueType": {
                "": "Reference",
                "name": "Number"
            },
            "defaultValue": {
                "": "IntegerLiteral",
                "value": 0
            }
        },
        {
            "": "FieldDeclaration",
            "id": {
                "": "Declarator",
                "name": "y"
            },
            "valueType": {
                "": "Reference",
                "name": "Number"
            },
            "defaultValue": {
                "": "IntegerLiteral",
                "value": 0
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
                "value": 10
            }
        ]
    }
});
