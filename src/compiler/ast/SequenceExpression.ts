import { Expression } from "./Expression";
import { Position, PositionFactory } from "../PositionFactory";


function merge(left?: Expression, right?: Expression): Expression | undefined {
    if (left == null) {
        return right;
    }
    if (right == null) {
        return left;
    }
    let nodes = new Array<Expression>();
    if (left instanceof SequenceExpression) {
        nodes.push(...left.expressions);
    }
    else {
        nodes.push(left);
    }
    if (right instanceof SequenceExpression) {
        nodes.push(...right.expressions);
    }
    else {
        nodes.push(right);
    }
    return new SequenceExpression(
        PositionFactory.merge(left.position, right.position),
        nodes,
    )
}

//  A group of nodes the type of which is the sequence of all nodes types
export class SequenceExpression extends Expression {

    constructor(
        position: Position,
        public readonly expressions: Expression[],
    ){
        super(position);
    }

    static flatten(...nodes: Array<Expression | null>) {
        let flat = new Array<Expression>();
        for (let node of nodes) {
            if (node instanceof SequenceExpression) {
                flat.push(...node.expressions);
            }
            else if (node != null) {
                flat.push(node);
            }
        }
        return flat;
    }

    static merge(left: Expression, right: Expression | undefined): Expression
    static merge(left: Expression | undefined, right: Expression): Expression
    static merge(...nodes: Array<Expression | undefined>): Expression | undefined
    static merge(...nodes: Array<Expression | undefined>): Expression | undefined {
        return nodes.reduce(merge, undefined);
    }

}
