import { Assembly } from "../../ast/Assembly";
import { resolveReferences } from "./resolveReferences";
import { identity } from "./identity";
import { semanticAnalysis } from "./semanticAnalysis";
import { resolveSingleStep_N } from "./resolveSingleStep";
import { addExplicitReturns } from "./addExplicitReturns";

type AssemblyPhase = (a: Assembly) => Assembly;

export const assemblyPhases = [
    identity,
    resolveReferences,
    addExplicitReturns,
    resolveSingleStep_N,
    semanticAnalysis,
] satisfies AssemblyPhase[];
