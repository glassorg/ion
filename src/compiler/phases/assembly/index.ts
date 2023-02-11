import { Assembly } from "../../ast/Assembly";
import { resolveReferences } from "./resolveReferences";
import { identity } from "./identity";
import { addExplicitReturns } from "./addExplicitReturns";
import { addElseIfReturn } from "./addElseIfReturn";
import { insertMultiFunctions } from "./insertMultiFunctions";
import { insertConditionals } from "./insertConditionals";
import { ssaForm } from "./ssaForm";
import { resolveSingleStep_N } from "./resolveSingleStep";

type AssemblyPhase = (a: Assembly) => Assembly;

export const assemblyPhases = [
    identity,
    insertMultiFunctions,
    resolveReferences,
    addExplicitReturns,
    addElseIfReturn,
    insertConditionals,
    ssaForm,
    resolveSingleStep_N,
    // semanticAnalysis,
] satisfies AssemblyPhase[];
