import { strict as assert } from "assert";
import { createParser } from "./createParser";

const parser = createParser();

const pst = parser.parseModule(`test`, `
foo = 10
bar = 20
z = "a" + "b"
`);

console.log(JSON.stringify(pst, null, 2));

