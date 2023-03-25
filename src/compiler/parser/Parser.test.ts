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
    "": "MemberExpression",
    "object": {
        "": "Reference",
        "name": "a"
    },
    "property": {
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

testParseExpression(`x: Number = 10`, {
    "": "VariableDeclaration",
    "type": {
        "": "TypeExpression",
        "constraints": [],
        "baseType": {
            "": "TypeReference",
            "name": "Number",
            "generics": []
        }
    },
    "id": {
        "": "Declarator",
        "name": "x"
    },
    "meta": [],
    "kind": "var",
    "defaultValue": {
        "": "IntegerLiteral",
        "value": "10"
    }
});

testParseExpression(`let x = 20`, {
    "": "VariableDeclaration",
    "id": {
      "": "Declarator",
      "name": "x"
    },
    "meta": [],
    "kind": "const",
    "value": {
      "": "IntegerLiteral",
      "value": "20"
    }
  });

testParseExpression(`type Foo = Bar | Baz & Buz`, {
    "": "VariableDeclaration",
    "type": {
      "": "TypeExpression",
      "constraints": [],
      "baseType": {
        "": "TypeReference",
        "resolved": true,
        "name": "Type",
        "generics": []
      }
    },
    "id": {
      "": "Declarator",
      "name": "Foo"
    },
    "meta": [],
    "kind": "type",
    "value": {
      "": "CompositeType",
      "left": {
        "": "TypeExpression",
        "constraints": [],
        "baseType": {
          "": "TypeReference",
          "name": "Bar",
          "generics": []
        }
      },
      "operator": "|",
      "right": {
        "": "CompositeType",
        "left": {
          "": "TypeExpression",
          "constraints": [],
          "baseType": {
            "": "TypeReference",
            "name": "Baz",
            "generics": []
          }
        },
        "operator": "&",
        "right": {
          "": "TypeExpression",
          "constraints": [],
          "baseType": {
            "": "TypeReference",
            "name": "Buz",
            "generics": []
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
    "left": {
      "": "ForVariantDeclaration",
      "id": {
        "": "Declarator",
        "name": "x"
      },
      "meta": []
    },
    "right": {
      "": "Reference",
      "name": "foo"
    },
    "body": {
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
        "": "VariableDeclaration",
        "type": {
          "": "TypeExpression",
          "constraints": [],
          "baseType": {
            "": "TypeReference",
            "name": "Number",
            "generics": []
          }
        },
        "id": {
          "": "Declarator",
          "name": "x"
        },
        "meta": [],
        "kind": "prop"
      },
      {
        "": "VariableDeclaration",
        "type": {
          "": "TypeExpression",
          "constraints": [],
          "baseType": {
            "": "TypeReference",
            "name": "Number",
            "generics": []
          }
        },
        "id": {
          "": "Declarator",
          "name": "y"
        },
        "meta": [],
        "kind": "prop"
      },
      {
        "": "VariableDeclaration",
        "type": {
          "": "TypeExpression",
          "constraints": [],
          "baseType": {
            "": "TypeReference",
            "name": "Number",
            "generics": []
          }
        },
        "id": {
          "": "Declarator",
          "name": "z"
        },
        "meta": [],
        "kind": "prop"
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
        "": "VariableDeclaration",
        "type": {
          "": "TypeExpression",
          "constraints": [],
          "baseType": {
            "": "TypeReference",
            "name": "Number",
            "generics": []
          }
        },
        "id": {
          "": "Declarator",
          "name": "x"
        },
        "meta": [],
        "kind": "prop"
      },
      {
        "": "VariableDeclaration",
        "type": {
          "": "TypeExpression",
          "constraints": [],
          "baseType": {
            "": "TypeReference",
            "name": "Number",
            "generics": []
          }
        },
        "id": {
          "": "Declarator",
          "name": "y"
        },
        "meta": [],
        "kind": "prop"
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

testParseExpression(`(a: Integer): Integer -> a`, {
    "": "FunctionExpression",
    "parameters": [
      {
        "": "VariableDeclaration",
        "type": {
          "": "TypeExpression",
          "constraints": [],
          "baseType": {
            "": "TypeReference",
            "resolved": true,
            "name": "Integer",
            "generics": []
          }
        },
        "id": {
          "": "Declarator",
          "name": "a"
        },
        "meta": [],
        "kind": "param"
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
    },
    "returnType": {
      "": "TypeExpression",
      "constraints": [],
      "baseType": {
        "": "TypeReference",
        "resolved": true,
        "name": "Integer",
        "generics": []
      }
    },
    "returnTypeExact": false
  })
