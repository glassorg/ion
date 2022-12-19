
``` typescript
{
    getAllSourceFilenames(): string[]
    getParsedDeclarations(filename: string): ParsedDeclaration[]
    mergeDeclarations(declarations: ParsedDeclaration[][]): ObjectMap<ParsedDeclaration>
    getAllParsedDeclarationsFromFilenames(filenames: string[]): ObjectMap<ParsedDeclaration>
        mergeDeclarations(...filenames.map(getParsedDeclarations))
    getAllParsedDeclarations(): ObjectMap<ParsedDeclaration>
        getAllParsedDeclarationsFromFilenames(
            getAllSourceFilenames()
        )
    checkForCircularDependencies(declarations: ObjectMap<ParsedDeclaration>): ObjectMap<ParsedDeclaration>
}
```