
const ignoreProperties = {
    constructor: true
}

function addDerivedClass(baseClass, derivedClass) {
    let baseClasses = derivedClass.baseClasses
    if (baseClasses == null) {
        baseClasses = derivedClass.baseClasses = new Set()
    }
    baseClasses.add(baseClass)
    if (baseClass.baseClasses) {
        for (let cls of baseClass.baseClasses.values()) {
            baseClasses.add(cls)
        }
    }
}

export function isDerivedClass(baseClass, derivedClass, debug?) {
    let baseClasses = derivedClass.baseClasses
    return baseClasses && baseClasses.has(baseClass)
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
