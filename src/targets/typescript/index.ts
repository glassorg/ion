import analysisToAssembly from "../../phases/analysisToAssembly";
import convertRefsToLocal from "../../phases/convertRefsToLocal";
import createImports from "../../phases/createImports";
import checkReferences from "../../phases/checkReferences";
import toTypescriptAst from "./toTypescriptAst";
import toTypescriptFiles, { removePrewritten } from "./toTypescriptFiles";
import writeFiles from "../../phases/writeFiles";
import addIndexFiles from "./addIndexFiles";

export default [
    analysisToAssembly,
    removePrewritten,
    convertRefsToLocal,
    createImports,
    checkReferences,
    toTypescriptAst,
    addIndexFiles,
    toTypescriptFiles,
    writeFiles,
]
