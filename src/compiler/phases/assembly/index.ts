import { Assembly } from "../../ast/Assembly";
import { resolveReferences } from "./resolveReferences";
import { addExplicitReturns } from "./addExplicitReturns";
import { addElseIfReturn } from "./addElseIfReturn";
import { insertMultiFunctions } from "./insertMultiFunctions";
import { insertConditionals } from "./insertConditionals";
import { ssaForm } from "./ssaForm";
import { resolveSingleStep_N } from "./resolveSingleStep";
import { postParser } from "./postParser";
import { identity } from "./identity";

type AssemblyPhase = (a: Assembly) => Assembly;

export const assemblyPhases = [
    identity,
    postParser,
    insertMultiFunctions,
    resolveReferences,
    addExplicitReturns,
    addElseIfReturn,
    insertConditionals,
    ssaForm,
    resolveSingleStep_N,
    // // semanticAnalysis,
] satisfies AssemblyPhase[];
