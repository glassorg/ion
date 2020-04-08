import Reference from "./Reference";

export function getExternalReferenceName(fileName, exportName) {
    return fileName + ":" + exportName
}

export default class ExternalReference extends Reference {

    file!: string
    export!: string

    constructor(...args) {
        super(...args)

        this.name = getExternalReferenceName(this.file, this.export)
    }

}