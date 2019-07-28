import Statement from "./Statement";
import Scope from "./Scope";
import { mixin } from ".";

export default class BlockStatement extends Statement implements Scope {

}
mixin(BlockStatement, Scope)