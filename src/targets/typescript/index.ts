import analysisToAssembly from "../../phases/analysisToAssembly";
import convertRefsToLocal from "../../phases/convertRefsToLocal";
import createImports from "../../phases/createImports";
import checkReferences from "../../phases/checkReferences";
import toTypescriptFiles, { removePrewritten } from "./toTypescriptFiles";
import toTypescriptAst from "./toTypescriptAst";
import writeFiles from "../../phases/writeFiles";
import restoreOriginalTypes from "../../phases/restoreOriginalTypes";
import reservedWords from "./reservedWords";
import renameReservedWords from "../../phases/renameReservedWords";
import createIndexFiles from "./createIndexFiles";

export default [
    analysisToAssembly,
    removePrewritten,
    restoreOriginalTypes,
    convertRefsToLocal,
    createImports,
    renameReservedWords(reservedWords),
    checkReferences,

    toTypescriptAst,
    createIndexFiles,
    toTypescriptFiles,
    writeFiles,
]
