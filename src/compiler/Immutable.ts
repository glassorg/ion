
export class Immutable {

    patch<T>(this: T, props: Partial<T>) {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), { ...this, ...props });
    }

    toJSON(): any {
        let properties: any = { "": this.constructor.name }
        for (let [name, value] of Object.entries(this)) {
            if (value != null) {
                properties[name] = value;
            }
        }
        return properties;
    }

}
