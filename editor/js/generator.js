// Code Generator APIs
// Note: likely (at present) to be browser specific - but should work on the persisted data and (expanded) javascript generator string
import * as text from "/common/text.js";

let fn = {}

function nextMatch(str, open, close) {
    // returns the next found parsed..open..matched..close..remaining
    // - matched will be false when no open..close found
    let [parsed, matched, remaining] = [str, false, false] // fall back when not found
    let index_open = str.indexOf(open)
    if (index_open != -1) { // found
        let left_match = index_open + open.length
        let index_close = str.indexOf(close, left_match)
        if (index_close != -1) { // found
            // so we have a match...
            let right_match = index_close + close.length
            parsed = str.substring(0, index_open)
            matched = str.substring(left_match, index_close)
            remaining = str.substring(right_match)
        }
    }
    return [parsed, matched, remaining]
}

function getCodeForBlock(block) {
    if (block.classList.contains("quando-disabled")) {
        return {script:"", postscript: ""}
    }
    let right = block.querySelector(".quando-right")
    let matches = []
    let block_script = ""
    let block_subscript = ""
    for (let row_box of right.children) { // i.e. for each row or box
        // collect the widget key values in matches array
        if (row_box.classList.contains("quando-row")) {
            for (let child of row_box.querySelectorAll('[data-quando-name]')) { // i.e. each named input
                // N.B. Cannot have box here - will cause strange effects...
                if (child.dataset.quandoName) {
                    let value = child.value
                    if ((typeof value) === 'string' && (child.dataset.quandoEncode != "raw")) {
                        value = text.encode(child.value)
                    }
                    matches[child.dataset.quandoName] = value // stores a lookup for the value
                }
            }
        }
        // collect the quando script and block/sub/post script
        if (row_box.classList.contains("quando-box")) {
            // should be && next if
            if (row_box.dataset.quandoName) {
                let box_id = '' // i.e. empty means no sub blocks
                let {script, postscript} = getCodeForElement(row_box)
                if (script != "") {
                    // get id of first block here
                    box_id += parseInt(script) // n.b. += forces a string
                    matches[row_box.dataset.quandoName] = box_id
                    block_script += "\n" + script
                    if (postscript != "") {
                        block_subscript += "\n" + postscript // force blankline between
                    }
                }
            }
        }
    }
    matches['data-quando-id'] = block.dataset.quandoId
    let script = '' // everything that has been parsed...
    let remaining = ''
    if (block.dataset && block.dataset.quandoScript) {
        remaining = block.dataset.quandoScript // i.e. what to parse
    }
    let parsed = ''
    let matched = ''
    while (remaining) {
        [parsed, matched, remaining] = nextMatch(remaining, '${', '}')
        script += parsed
        if (matched) {
            let substitute = matches[matched]
            if (typeof substitute === 'string') {
                script += substitute
            } else {
                console.log('Warning - ${' + matched + '} is type ' + typeof substitute + ' - passed through')
                script += '${' + matched + '}'
            }
        }
    }
    remaining = script // second pass for $(...)$ - parameters are already substituted
    script = ''
    while (remaining) {
        [parsed, matched, remaining] = nextMatch(remaining, '$(', ')$')
        script += parsed
        if (matched) {
            // split into comma separated
            let params = matched.split('$,')
            let func = fn[params[0]]
            if (func) {
                params[0] = block
                script += func.apply(null, params)
            } else {
                console.log("Warning - function generator.fn." + matched + "() not found")
            }
        }
    }
    return { script: script, postscript: block_script }
}

function getCodeForElement(elem) {
    if (elem.classList.contains("quando-disabled")) {
        return { script: "", postscript: "" }
    }
    let scriptblock = ""
    let subscript = ""
    let children = elem.children
    for (let child of children) {
        if (child.dataset.quandoScript) {
            let {script, postscript} = getCodeForBlock(child)
            if (script != "") {
                if (scriptblock != "") {
                    scriptblock += "\n" // separate lines
                }
                scriptblock += script
                if (postscript != "") {
                    if (subscript != "") {
                        subscript += "\n" // separate lines
                    }
                    subscript += postscript
                }
            }
        }
    }
    // may need to check substring for empty?!
    return { script: scriptblock, postscript: subscript }
}

export function getQuandoScript(elem) {
    let {script, postscript} = getCodeForElement(elem)
    if (postscript != "") {
        script += "\n" + postscript // add blankline between blocks
    }
    return script
}

fn.log = (block, str) => {
    console.log(str)
    return ""
}

fn.visible = (block, name, str) => {
    let result = ''
    let elem = block.querySelector('[data-quando-name='+name+']')
    if (elem && elem.style.display != 'none') {
        result = str
    }
    return result
}

fn.$ = () => { return "$" }
fn.nl = () => { return "\n" }
fn.parameter = (block, param) => {
    return "${"+param+"}"
}
fn.displayTitle = (block, display_id) => {
    let result = '----'
    let select = block.querySelector('select[data-quando-name='+display_id+']') // find the select
    if (select) {
        let value = select.value // this is the id
        let option = select.querySelector("option[value='" + value + "']")
        if (option) {
            result = text.encode(option.innerHTML)
        }
    }
    return result
}

fn.hasAncestorClass = (block, cls) => {
    let check = block
    let found = false
    while (!(found || (check==document))) {
        // i.e. continue until the class is found, or document is the ancestor
        check = check.parentNode
        let type = check && check.dataset && check.dataset.quandoBlockType
        if (type == cls) { // found it...
            found = true
        }
    }
    return found
}

fn.inDisplay = (block) => {
    return fn.hasAncestorClass(block, 'display-when-display')
}

fn.rgb = (block, colour) => {
    // Modifed from https://stackoverflow.com/questions/36697749/html-get-color-in-rgb for conversion function
    // Converts #rrggbb to 'rrr, ggg, bbb'`
    return colour.match(/[A-Za-z0-9]{2}/g).map((v) => { return parseInt(v, 16) }).join(",")
}

fn.eq = (block, str, val, gen, gen_else='') => {
    let result = gen_else
    if (str == val) {
        result = gen
    }
    return result
}

fn.hasValue = (block, str, gen, gen_else='') => {
    let result = gen_else
    if (str) {
        result = gen
    }
    return result
}