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
import inputToAnalysis from "./inputToAnalysis";
import inheritBaseClasses from "./inheritBaseClasses";

export default [
    // input stage
    parsing,
    semanticValidation,
    importResolution,
    
    // analysis stage
    inputToAnalysis,
    checkReferences,
    inheritBaseClasses,
    
    // output phase depends on target
    
    // typeCreation,
    // // // typeNormalization,
    // // toJavascriptAst,
    // // toJavascriptFiles,
    // // writeFiles,
]