import parsing from "./parsing";
import semanticValidation from "./semanticValidation";
import importResolution from "./importResolution";
// import addIsTypeFunctions from "./addIsTypeFunctions";
import convertRefsToAbsolute from "./convertRefsToAbsolute";
import assemblyToAnalysis from "./assemblyToAnalysis";
import inheritBaseClasses from "./inheritBaseClasses";
import createClassTypeChecks from "./createClassTypeChecks";
import checkReferences from "./checkReferences";
// import normalizeTypes from "./normalizeTypes";
import addImplicitReturns from "./addImplicitReturns";
import inferTypes from "./inferTypes";
import createConditionalDeclarations from "./createConditionalDeclarations";
import removeConditionalDeclarations from "./removeConditionalDeclarations";

export default [
    // input stage
    parsing,
    semanticValidation,
    importResolution,
    // addImplicitReturns,
    // addIsTypeFunctions,
    // analysis stage
    convertRefsToAbsolute,
    assemblyToAnalysis,
    // createConditionalChains,
    createConditionalDeclarations,
    // insertVirtualDeclarations,
    inheritBaseClasses,
    // createClassTypeChecks,
    // // normalizeTypes,
    inferTypes,
    removeConditionalDeclarations,
    // checkReferences,
]