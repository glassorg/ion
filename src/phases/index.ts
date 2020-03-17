import parsing from "./parsing";
import importResolution from "./importResolution";
import typeNormalization from "./typeNormalization";
import typeCreation from "./typeCreation";
import toJavascriptAst from "./toJavascriptAst";

function identity(node) { return node }

export default [
    parsing,
    importResolution,
    typeNormalization,
    typeCreation,
    toJavascriptAst,
    identity,
]