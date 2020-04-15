import analysisToAssembly from "../../phases/analysisToAssembly";
import convertRefsToLocal from "../../phases/convertRefsToLocal";
import createImports from "../../phases/createImports";
import checkReferences from "../../phases/checkReferences";
import toJavascriptAst from "./toJavascriptAst";
import toJavascriptFiles from "./toJavascriptFiles";
import writeFiles from "../../phases/writeFiles";

export default [
    analysisToAssembly,
    convertRefsToLocal,
    createImports,
    checkReferences,
    toJavascriptAst,
    toJavascriptFiles,
    writeFiles,
]
