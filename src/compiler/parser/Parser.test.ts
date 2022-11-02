import { strict as assert } from "assert";
import { createTokenizer } from "../tokenizer/createTokenizer";
import { createParser } from "./createParser";

const parser = createParser();

function testParseExpression(source: string, expectedJSON: any) {
    parser.setSource("test", source);
    const expression = parser.parseExpression();
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
    "": "BinaryExpression",
    "left": {
        "": "Reference",
        "name": "a"
    },
    "operator": "+",
    "right": {
        "": "IntegerLiteral",
        "value": 1
    }
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
        "": "Identifier",
        "name": "x"
    },
    "type": {
        "": "Reference",
        "name": "Number"
    },
    "value": {
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
    "type": null,
    "value": {
        "": "IntegerLiteral",
        "value": 20
    }
});

testParseExpression(`type Foo = Bar | Baz`, {
    "": "TypeDeclaration",
    "id": {
        "": "Declarator",
        "name": "Foo"
    },
    "type": null,
    "value": {
        "": "BinaryExpression",
        "left": {
            "": "Reference",
            "name": "Bar"
        },
        "operator": "|",
        "right": {
            "": "Reference",
            "name": "Baz"
        }
    }
});