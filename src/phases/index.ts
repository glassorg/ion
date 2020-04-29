import parsing from "./parsing";
import semanticValidation from "./semanticValidation";
import importResolution from "./importResolution";
import typeCreation from "./typeCreation";
import convertRefsToAbsolute from "./convertRefsToAbsolute";
import assemblyToAnalysis from "./assemblyToAnalysis";
// import checkReferences from "./checkReferences";
// import inheritBaseClasses from "./inheritBaseClasses";
// import createClassTypeChecks from "./createClassTypeChecks";

export default [
    // input stage
    parsing,
    semanticValidation,
    importResolution,
    typeCreation,

    // analysis stage
    convertRefsToAbsolute,
    assemblyToAnalysis,
    // inheritBaseClasses,
    // createClassTypeChecks,
    // checkReferences,
]