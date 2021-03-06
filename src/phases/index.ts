import parsing from "./parsing";
import semanticValidation from "./semanticValidation";
import importResolution from "./importResolution";
import typeCreation from "./typeCreation";
import convertRefsToAbsolute from "./convertRefsToAbsolute";
import assemblyToAnalysis from "./assemblyToAnalysis";
import inheritBaseClasses from "./inheritBaseClasses";
import createClassTypeChecks from "./createClassTypeChecks";
import checkReferences from "./checkReferences";
import normalizeTypes from "./normalizeTypes";
import addImplicitReturns from "./addImplicitReturns";
import inferTypes from "./inferTypes";

export default [
    // input stage
    parsing,
    semanticValidation,
    importResolution,
    addImplicitReturns,
    typeCreation,

    // analysis stage
    convertRefsToAbsolute,
    assemblyToAnalysis,
    inheritBaseClasses,
    createClassTypeChecks,
    normalizeTypes,
    inferTypes,
    // checkReferences,
]