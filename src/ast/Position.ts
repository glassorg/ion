
export default class Position {    
    line: number
    column: number

    constructor(line: number, column: number) {
        this.line = line
        this.column = column
    }

    clone() {
        return this
    }

}
