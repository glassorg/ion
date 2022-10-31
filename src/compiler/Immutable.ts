
export class Immutable {

    patch<T>(this: T, props: Partial<T>) {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), { ...this, props });
    }

    toJSON(): any {
        return { "": this.constructor.name, ...this }
    }

}
