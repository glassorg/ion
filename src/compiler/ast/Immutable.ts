
type Patch<T,P> = T & Omit<T,keyof P> & P;

export class Immutable {

    patch<T, P extends Partial<T> = Partial<T>>(this: T, props: P): Patch<T,P> {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), { ...this, ...props });
    }

    toJSON(): any {
        let properties: any = { "": this.constructor.name }
        for (let name in this) {
            let value = this[name];
            if (value != null && value !== this.constructor.prototype[name]) {
                properties[name] = value;
            }
        }
        return properties;
    }

}
