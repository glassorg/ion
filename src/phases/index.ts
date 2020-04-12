import parsing from "./parsing";
import importResolution from "./importResolution";
// import typeNormalization from "./typeNormalization";
// import typeCreation from "./typeCreation";
// import toJavascriptAst from "./toJavascriptAst";
import semanticValidation from "./semanticValidation";
// import toJavascriptFiles from "./toJavascriptFiles";
// import writeFiles from "./writeFiles";
// import declarationMigration from "./declarationMigration";
// import declarationIsolation from "./declarationIsolation";
import checkReferences from "./checkReferences";

export default [
    parsing,
    semanticValidation,
    importResolution,

    // typeCreation,
    // declarationIsolation,
    // declarationMigration,
    // checkReferences,

    // // // typeNormalization,
    // // toJavascriptAst,
    // // toJavascriptFiles,
    // // writeFiles,
]