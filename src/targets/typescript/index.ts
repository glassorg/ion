import analysisToAssembly from "../../phases/analysisToAssembly";
import convertRefsToLocal from "../../phases/convertRefsToLocal";
import createImports from "../../phases/createImports";
import checkReferences from "../../phases/checkReferences";

export default [
    analysisToAssembly,
    convertRefsToLocal,
    createImports,
    checkReferences
]
