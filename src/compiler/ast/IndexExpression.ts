import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";

// export class IndexExpression extends Expression {

//     constructor(
//         location: SourceLocation,
//         public readonly object: Expression,
//         public readonly index: Expression,
//     ){
//         super(location);
//     }

//     toString(includeTypes = true): string {
//         return `${this.object.toString(includeTypes)}[${this.index.toString(includeTypes)}]`;
//     }

// }