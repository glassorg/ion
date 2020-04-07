import { strict as assert } from "assert"
import * as t from "../Traversal";

class MyNode {
    value: number
    children: MyNode[]
    constructor(value: number, ...children: MyNode[]) {
        this.value = value
        this.children = children
    }
}

{
    // check enter/leave order and filtering out of array
    let root = [
        new MyNode(1),
        new MyNode(2),
        { value: 100, shouldBeFiltered: "probably" },
        new MyNode(3)
    ]
    let order: number[] = []
    let result = t.traverse(root, {
        enter(node) {
            order.push(node.value)
        },
        leave(node) {
            order.push(-node.value)
        }
    })
    assert.deepEqual(order, [1, -1, 2, -2, 3, -3])
}

{
    // test children pre-order
    let root = [
        new MyNode(1, new MyNode(11), new MyNode(12)),
        new MyNode(2, new MyNode(21), new MyNode(22)),
        new MyNode(3, new MyNode(31), new MyNode(32))
    ]

    let order: number[] = []
    let result = t.traverse(root, {
        enter(node) {
            order.push(node.value)
        },
        leave(node) {
            order.push(-node.value)
        }
    })
    assert.deepEqual(order, [
        1, 11, -11, 12, -12, -1,
        2, 21, -21, 22, -22, -2,
        3, 31, -31, 32, -32, -3
    ])
}

{
    //  test skipping children.
    let root = [
        new MyNode(1, new MyNode(11), new MyNode(12)),
        new MyNode(2, new MyNode(21), new MyNode(22)),
        new MyNode(3, new MyNode(31), new MyNode(32))
    ]

    let order: number[] = []
    let result = t.traverse(root, {
        enter(node) {
            order.push(node.value)
            if (node.value === 2) {
                return t.skip
            }
        },
        leave(node) {
            order.push(-node.value)
        }
    })
    assert.deepEqual(order, [
        1, 11, -11, 12, -12, -1,
        2, -2,
        3, 31, -31, 32, -32, -3
    ])
}

{
    //  test array removal.
    let root = [
        new MyNode(1, new MyNode(11), new MyNode(12)),
        new MyNode(2, new MyNode(21), new MyNode(22)),
        new MyNode(3, new MyNode(31), new MyNode(32))
    ]

    let result = t.traverse(root, {
        leave(node) {
            if (node.value.toString().indexOf("1") >= 0) {
                return t.remove
            }
        }
    })
    assert.deepEqual(
        result,
        [
            new MyNode(2, new MyNode(22)),
            new MyNode(3, new MyNode(32))
        ]
    )
}

{
    //  test array insertion.
    let root = [
        new MyNode(1, new MyNode(11), new MyNode(12)),
        new MyNode(2, new MyNode(21), new MyNode(22)),
        new MyNode(3, new MyNode(31), new MyNode(32))
    ]

    let result = t.traverse(root, {
        leave(node) {
            if (node.value === 2) {
                return t.replace(new MyNode(201), new MyNode(202))
            }
        },
        skip(node) {
            // have to tell it not to skip objects since it does by default
            return false
        }
    })
    // we stringify to make sure the order is as specified as well
    assert.deepEqual(
        result,
        [
            new MyNode(1, new MyNode(11), new MyNode(12)),
            new MyNode(201),
            new MyNode(202),
            new MyNode(3, new MyNode(31), new MyNode(32))
        ]
    )
}

{
    //  test object removal.
    let root = {
        a: new MyNode(1, new MyNode(11), new MyNode(12)),
        b: new MyNode(2, new MyNode(21), new MyNode(22)),
        c: new MyNode(3, new MyNode(31), new MyNode(32))
    }

    let result = t.traverse(root, {
        leave(node) {
            if (node.value === 2) {
                return t.remove
            }
        },
        skip(node) {
            // have to tell it not to skip objects since it does by default
            return false
        }
    })
    assert.deepEqual(
        result,
        {
            a: new MyNode(1, new MyNode(11), new MyNode(12)),
            c: new MyNode(3, new MyNode(31), new MyNode(32))
        }
    )
}

{
    //  test object insertion.
    let root = {
        a: new MyNode(1, new MyNode(11), new MyNode(12)),
        b: new MyNode(2, new MyNode(21), new MyNode(22)),
        c: new MyNode(3, new MyNode(31), new MyNode(32))
    }

    let result = t.traverse(root, {
        leave(node) {
            if (node.value === 2) {
                return t.replace(
                    t.pair("b1", new MyNode(201)),
                    t.pair("b2", new MyNode(202))
                )
            }
        },
        skip(node) {
            // have to tell it not to skip objects since it does by default
            return false
        }
    })
    // we stringify to make sure the order is as specified as well
    assert.deepEqual(
        JSON.stringify(result),
        JSON.stringify({
            a: new MyNode(1, new MyNode(11), new MyNode(12)),
            b1: new MyNode(201),
            b2: new MyNode(202),
            c: new MyNode(3, new MyNode(31), new MyNode(32))
        })
    )
}

{
    //  test Map removal.
    let root = new Map([
        ["a", new MyNode(1, new MyNode(11), new MyNode(12))],
        ["b", new MyNode(2, new MyNode(21), new MyNode(22))],
        ["c", new MyNode(3, new MyNode(31), new MyNode(32))]
    ])

    let result = t.traverse(root, {
        leave(node) {
            if (node.value === 2) {
                return t.remove
            }
        }
    })
    assert.deepEqual(
        result,
        new Map([
            ["a", new MyNode(1, new MyNode(11), new MyNode(12))],
            ["c", new MyNode(3, new MyNode(31), new MyNode(32))]
        ])
    )
}

{
    //  test Map insertion.
    let root = new Map([
        ["a", new MyNode(1, new MyNode(11), new MyNode(12))],
        ["b", new MyNode(2, new MyNode(21), new MyNode(22))],
        ["c", new MyNode(3, new MyNode(31), new MyNode(32))]
    ])

    let result = t.traverse(root, {
        leave(node) {
            if (node.value === 2) {
                return t.replace(
                    t.pair("b1", new MyNode(201)),
                    t.pair("b2", new MyNode(202))
                )
            }
        }
    })
    // we stringify to make sure the order is as specified as well
    assert.deepEqual(
        result,
        new Map([
            ["a", new MyNode(1, new MyNode(11), new MyNode(12))],
            ["b1", new MyNode(201)],
            ["b2", new MyNode(202)],
            ["c", new MyNode(3, new MyNode(31), new MyNode(32))]
        ])
    )
}
