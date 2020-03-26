
class ion_Number {
    static is(value): value is number {
        return typeof value === "number";
    }
}

export const Number = ion_Number
