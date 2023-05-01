import { Identifier } from "../ast/Identifier";
import { Reference } from "../ast/Reference";
import { traverse } from "./traverse";

export const ssaVersionSeparator = ":";

export function isSSAVersionName(name: string) {
    return name.lastIndexOf(ssaVersionSeparator) >= 0;
}

export function getSSAVersionName(name: string, count: number) {
    return `${name}${ssaVersionSeparator}${count}`;
}

export function getSSAVersionNumber(name: string) {
    let index = name.lastIndexOf(ssaVersionSeparator);
    if (index < 0) {
        return 0;
    }
    return parseInt(name.slice(index + 1));
}

export function getSSAUniqueName(name: string) {
    let lastIndex = name.lastIndexOf(ssaVersionSeparator);
    return lastIndex >= 0 ? name.slice(0, lastIndex) : name;
}

export function getSSAOriginalName(name: string) {
    let lastIndex = name.indexOf(ssaVersionSeparator);
    return lastIndex >= 0 ? name.slice(0, lastIndex) : name;
}

export function getSSANextVersion(name: string) {
    return getSSAVersionName(getSSAUniqueName(name), getSSAVersionNumber(name) + 1);
}

