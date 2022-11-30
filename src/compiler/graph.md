
1 getAllSourceFilenames() ->
|
* readFile(filename: string): string
|
* parse(filename: string, source: string): Declaration[]
|
1 getAllDeclarations(): DeclarationMap  ()
|   -> _getAllDeclarationsFromFilenames(filenames: string[])
|       -> _mergeAllDeclarations(...moduleDeclarations: Declaration[][])
|
* getDeclaration()
|
