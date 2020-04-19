import Position from "./Position";

export default class Location {
    start: Position
    end: Position
    filename: string

    constructor(start: Position, end: Position, filename: string) {
        this.start = start
        this.end = end
        this.filename = filename
    }

    clone() {
        return this
    }

}