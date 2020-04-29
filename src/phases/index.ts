import parsing from "./parsing";
import semanticValidation from "./semanticValidation";
import importResolution from "./importResolution";
// import checkReferences from "./checkReferences";
// import assemblyToAnalysis from "./assemblyToAnalysis";
// import inheritBaseClasses from "./inheritBaseClasses";
// import convertRefsToAbsolute from "./convertRefsToAbsolute";
// import typeCreation from "./typeCreation";
// import createClassTypeChecks from "./createClassTypeChecks";

export default [
    // input stage
    parsing,
    semanticValidation,
    importResolution,
    // typeCreation,

    // // analysis stage
    // convertRefsToAbsolute,
    // assemblyToAnalysis,
    // inheritBaseClasses,
    // createClassTypeChecks,
    // checkReferences,
]