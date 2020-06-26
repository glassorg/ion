import * as np from "path"
import * as common from "./common"
import { readFileSync } from "fs";

const jsondiffpatch: any = require('jsondiffpatch').create({})
const remove__prefixedProperties = (key: string, value:any) => key.startsWith("__") ? undefined : value
const uniqueId = Symbol('uniqueId')
let nextId = 0
const ignoreProperties: {[name:string]:boolean} = {
    location: true
}

function ignore(property) {
    if (property == null) {
        debugger
    }
    return ignoreProperties[property] || property.startsWith("_") //|| /\bion\b/.test(property)
}

export function stringify(object, indent = 2) {
    return JSON.stringify(cloneWithJsonReferences(object), null, indent);
}

function cloneWithJsonReferences(object: any, path: string[] = []) {
    let type = typeof object
    if (object == null || type == 'string' || type == 'number' || type == 'boolean')
        return object
    let className = object.constructor.path || object.constructor.name
    
    if (object.toJSON)
        object = object.toJSON()
    let clone: any = Array.isArray(object) ? [] : className === "Object" ? {} : {"": className}
    if (object instanceof Map) {
        for (let key of object.keys()) {
            if (ignore(key)) {
                continue
            }
            clone[key] = cloneWithJsonReferences(object.get(key), path)
        }
    }
    if (object instanceof Set) {
        let index = 0
        for (let value of object.values()) {
            clone[index++] = cloneWithJsonReferences(value, path)
        }
    }
    else {
        for (let property in object) {
            if (ignore(property)) {
                continue
            }
    
            path.push(property)
            clone[property] = cloneWithJsonReferences(object[property], path)
            path.pop()
        }
    }
    return clone
}

export function create(outputPath: string) {
    let style = readFileSync("node_modules/jsondiffpatch/public/formatters-styles/html.css")
    // console.log(style)
    // let outputToStyle = np.relative(np.dirname(outputPath), "node_modules/jsondiffpatch/dist/formatters-styles/html.css")
    let passes: [string[],object][] = []
    return function(names?: string | string[], ast?: any) {
        if (names != null) {
            if (!Array.isArray(names))
                names = [names]
            passes.push([names, cloneWithJsonReferences(ast)])
            // passes.push([names, JSON.parse(JSON.stringify(cloneWithJsonReferences(ast), remove__prefixedProperties))])
        } else {
            // convert to HTML
            let previous: string | null = null
            let html = [
`
<html>
    <head>
        <style>
        ${style.toString()}
        </style>
        <style>
        :root {
            --border: solid 1px gray;
        }
        body {
            display: flex;
            flex-direction: row;
            font-size: 12px;
            font-family: Monaco;
        }
        article {
            border: var(--border);
        }
        article {
            border: var(--border);
            padding: 0px;
        }
        article:not(:last-child) {
            border-right: none;
        }
        article header {
            color: rgb(150,150,150);
            background-color: rgb(45,45,45);
            font-weight: bold;
            padding: 8px;
            margin: 0px;
            border-bottom: var(--border);
        }
        article header:hover {
            display: flex;
            flex-direction: column;
        }
        article p {
            padding: 0px 8px;
            white-space: pre;
        }
        ins {
            color: lightgreen;
            text-decoration: none;
        }
        del {
            color: red;
            text-decoration: none;
        }
        </style>
    </head>
    <body onclick="location.reload(true)">
`,
...passes.map(([names, ast]: any) => {
    if (!Array.isArray(names))
        names = [names]
    // convert to show refs
    let delta = previous != null ? jsondiffpatch.diff(previous, ast) : null
    let html;
    if (typeof ast === "string") {
        html = ast
    }
    else {
        html = require('jsondiffpatch/src/formatters/html').format(delta || {}, previous || ast)
    }
    previous = ast
    return `
        <article>
            <header><span>${names.join(', </span><span>')}</span></header>
            <p>${html.replace(/\\n/g, '<br>')}</p>
        </article>
    `
}),
`
    </body>
</html>
`
            ].join('')
            common.write(outputPath, html)
            console.log('debug written to ', outputPath)
        }
    }
}