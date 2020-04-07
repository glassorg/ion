import parsing from "./parsing";
import importResolution from "./importResolution";
import typeNormalization from "./typeNormalization";
import typeCreation from "./typeCreation";
import toJavascriptAst from "./toJavascriptAst";
import readFiles from "./readFiles";
import semanticValidation from "./semanticValidation";
import toJavascriptFiles from "./toJavascriptFiles";
import writeFiles from "./writeFiles";

export default [
    readFiles,
    parsing,
    semanticValidation,
    importResolution,
    // typeNormalization,
    typeCreation,
    toJavascriptAst,
    toJavascriptFiles,
    writeFiles,
]