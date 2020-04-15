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
import assemblyToAnalysis from "./assemblyToAnalysis";
import inheritBaseClasses from "./inheritBaseClasses";
import analysisToAssembly from "./analysisToAssembly";
import convertRefsToAbsolute from "./convertRefsToAbsolute";
import convertRefsToLocal from "./convertRefsToLocal";
import typeCreation from "./typeCreation";

export default [
    // input stage
    parsing,
    semanticValidation,
    importResolution,
    typeCreation,

    // analysis stage
    convertRefsToAbsolute,
    assemblyToAnalysis,
    checkReferences,
    inheritBaseClasses,
    
    // output phase depends on target
    // analysisToAssembly,
    // convertRefsToLocal,
    
    // typeCreation,
    // // // typeNormalization,
    // // toJavascriptAst,
    // // toJavascriptFiles,
    // // writeFiles,
]