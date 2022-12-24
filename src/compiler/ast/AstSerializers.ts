import { Serializer } from "../common/Serializer";
import * as astNamespace from "./AstNamespace";

export const ISONDebug = new Serializer(astNamespace, { indent: 2, omit: ["location"] });
export const ISON = new Serializer(astNamespace);
