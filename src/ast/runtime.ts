
const ignoreProperties = {
    constructor: true
}

const derivedClasses = new Map<any,Set<any>>()

function addDerivedClass(baseClass, derivedClass) {
    let set = derivedClasses.get(baseClass)
    if (set == null) {
        derivedClasses.set(baseClass, set = new Set())
    }
    set.add(derivedClass)
}

export function isDerivedClass(baseClass, derivedClass) {
    let set = derivedClasses.get(baseClass)
    return set ? set.has(derivedClass) : false
}

export function mixin(derivedCtor: any, ...baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        addDerivedClass(baseCtor, derivedCtor)
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            if (!ignoreProperties[name]) {
                Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name)!);
            }
        });
    });
}
