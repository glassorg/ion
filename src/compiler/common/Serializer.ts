
type Namespace = { [name: string]: any };

function getId(ctor: any) {
    return ctor.id ?? ctor.name
}

type Options = {
    indent?: number;
    omit?: string[];
}

export let typeKey = ""
//  we are not using the JSON replacer or reviver because our minimal traversal is more efficent
//  when parsing and we need a custom traversal when stringifying
export class Serializer {
    indent: number;
    omit: Set<string>;
    namespace: Namespace
        constructor(namespace: Namespace, options?: Options) {
            this.namespace = namespace;
            this.indent = options?.indent || 0;
            this.omit = new Set(options?.omit);
            this.parse = this.parse.bind(this);
            this.stringify = this.stringify.bind(this);
            this.replacer = this.replacer.bind(this);
            this.reviver = this.reviver.bind(this);
        }

    reviver(key: string, value: any) {
        if (value && typeof value === "object") {
            let { [typeKey]: type, ...rest} = value;
            if (type) {
                if (this.namespace.hasOwnProperty(type)) {
                    let ctor = this.namespace[type];
                    return Object.assign(Object.create(ctor.prototype), rest);
                }
                else {
                    throw new Error(`Type '${type}' is not in namespace so cannot be deserialized`);
                }
            }
        }
        return value;
    }

    parse(text: string) {
        return JSON.parse(text, this.reviver);
    }

    replacer(key: string, value: any) {
        if (this.omit.has(key)) {
            return undefined;
        }
        if (Array.isArray(value)) {
            return [...value];
        }
        if (value && typeof value === "object") {
            let type = value.constructor.name
            if (this.namespace.hasOwnProperty(type)) {
                return { [typeKey]: type, ...value }
            }
            else {
                return { ...value }
            }
        }
        return value
    }

    stringify(root: any)  {
        // root = this.toJSON(root)
        return JSON.stringify(root, this.replacer, this.indent > 0 ? this.indent : undefined);
    }

}

