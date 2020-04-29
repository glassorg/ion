import Assembly from "../../ast/Assembly";

export default function addIndexFiles(root: Assembly) {
    let folders = new Map<string, Array<string>>()
    for (let path in root.modules) {
        let steps = path.split('.')
        let parent = steps.slice(0, -1).join('.')
        let name = steps[steps.length - 1]
        let folder = folders.get(parent)
        if (folder == null) {
            folders.set(parent, folder = []);
        }
        folder.push(name)
    }
    for (let folder of folders.keys()) {
        let path = folder + ".index"
        let children = folders.get(folder)!
        root.modules[path] = {
            type: "Program",
            body: children.map(child => {
                let localName = "_" + child
                return [
                    {
                        type: "ImportDeclaration",
                        specifiers: [
                            {
                                type: "ImportNamespaceSpecifier",
                                local: { type: "Identifier", name: localName }
                            }
                        ],
                        source: { type: "Literal", value: `./${child}` }
                    },
                    {
                        type: "ExportNamedDeclaration",
                        declaration: {
                            type: "VariableDeclaration",
                            kind: "const",
                            declarations: [
                                {
                                    type: "VariableDeclarator",
                                    id: { type: "Identifier", name: child },
                                    init: { type: "Identifier", name: localName }
                                }
                            ]
                        }
                    }
                ]
            }).flat()
        } as any
    }
}
