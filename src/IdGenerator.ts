
export default class IdGenerator
{

    public ids = new Set<string>()

    createNewIdName(name: string) {
        while (this.ids.has(name)) {
            name = "_" + name
        }
        this.ids.add(name)
        return name
    }

}