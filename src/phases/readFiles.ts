import { getInputFilesRecursive, toMap } from "../common";
import Assembly from "../ast/Assembly";

export default function readFiles(root: Assembly) {
    root._inputFiles = toMap(getInputFilesRecursive(root.options.input))
}