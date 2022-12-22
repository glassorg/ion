import { Declaration } from "./ast/Declaration";

export type ObjectMap<T> = { [name: string]: T };
export type GlobalMap = ObjectMap<Declaration>;
