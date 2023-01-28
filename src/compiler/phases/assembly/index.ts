import { Assembly } from "../../ast/Assembly";
import { resolveReferences } from "./resolveReferences";
import { identity } from "./identity";
import { semanticAnalysis } from "./semanticAnalysis";
import { resolveSingleStep_N } from "./resolveSingleStep";
import { addExplicitReturns } from "./addExplicitReturns";
import { addElseIfReturn } from "./addElseIfReturn";
import { insertConditionals } from "./insertConditionals";

type AssemblyPhase = (a: Assembly) => Assembly;

export const assemblyPhases = [
    identity,
    resolveReferences,
    addExplicitReturns,
    addElseIfReturn,
    insertConditionals,
    resolveSingleStep_N,
    semanticAnalysis,
] satisfies AssemblyPhase[];
