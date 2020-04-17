import parsing from "./parsing";
import importResolution from "./importResolution";
import semanticValidation from "./semanticValidation";
import checkReferences from "./checkReferences";
import assemblyToAnalysis from "./assemblyToAnalysis";
import inheritBaseClasses from "./inheritBaseClasses";
import convertRefsToAbsolute from "./convertRefsToAbsolute";
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
]