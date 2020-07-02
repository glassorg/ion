import parsing from "./parsing";
import semanticValidation from "./semanticValidation";
import importResolution from "./importResolution";
// import addIsTypeFunctions from "./addIsTypeFunctions";
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
    // <- here, prior to adding implicit returns, we could convert expressions first
    addImplicitReturns,
    // addIsTypeFunctions,
    // // analysis stage
    convertRefsToAbsolute,
    assemblyToAnalysis,
    inheritBaseClasses,
    // // post most analysis
    // // createClassTypeChecks,
    // // // normalizeTypes,
    // inferTypes,
    // // checkReferences,
]