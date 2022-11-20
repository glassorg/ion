
export class Immutable {

    patch<T>(this: T, props: Partial<T>) {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), { ...this, ...props });
    }

    toJSON(): any {
        let properties: any = { "": this.constructor.name }
        for (let name in this) {
            let value = this[name];
            if (value != null) {
                properties[name] = value;
            }
        }
        return properties;
    }

}
