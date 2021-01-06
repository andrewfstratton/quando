// Code Generator APIs
// Note: likely (at present) to be browser specific - but should work on the persisted data and (expanded) javascript generator string
import * as text from "/common/text.js";

let fn = {}
let _prefix = ''

export function prefix() {
    let result = _prefix
    _prefix = ''
    if (result == '') {
        result = false
    } else {
        result += '\n'
    }
    return result
}

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

export function getCodeInBlock(block) {
    let code = ''
    if (block.dataset && block.dataset.quandoJavascript) {
        code = block.dataset.quandoJavascript
    }
    let right = block.querySelector(".quando-right")
    let matches = []
    for (let row_box of right.children) { // i.e. for each row or box
        // collect the substitions in matches array
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
        } else if (row_box.classList.contains("quando-box")) {
            let box_code = ''
            if (row_box.dataset.quandoName) {
                let separator = "\n"
                let pre = ""
                let post = ""
                if (row_box.dataset.quandoFnArray) {
                    pre = "() => {\n"
                    separator = ",\n"
                    post = "}"
                }
                let infix = ''
                for (let block of row_box.children) {
                    box_code += infix + pre + getCode(block) + post
                    if (infix == '') {
                        infix = separator
                    }
                }
                matches[row_box.dataset.quandoName] = box_code
            }
        }
    }
    matches['data-quando-id'] = block.dataset.quandoId
    let remaining = code // i.e. what to parse
    code = '' // what has been parsed...
    let parsed = ''
    let matched = ''
    while (remaining) {
        [parsed, matched, remaining] = nextMatch(remaining, '${', '}')
        code += parsed
        if (matched) {
            let substitute = matches[matched]
            if (typeof substitute === 'string') {
                code += substitute
            } else {
                console.log('Warning - ${' + matched + '} is type ' + typeof substitute + ' - passed through')
                code += '${' + matched + '}'
            }
        }
    }
    remaining = code // second pass for $(...)$ - parameters are already substituted
    code =''
    while (remaining) {
        [parsed, matched, remaining] = nextMatch(remaining, '$(', ')$')
        code += parsed
        if (matched) {
            // split into comma separated
            let params = matched.split('$,')
            let func = fn[params[0]]
            if (func) {
                params[0] = block
                code += func.apply(null, params)
            } else {
                console.log("Warning - function generator.fn." + matched + "() not found")
            }
        }
    }
    return code
}
    
export function getCode(block) {
    let result = '' 
    if (block.dataset.quandoJavascript && !block.classList.contains("quando-disabled")) {
      result = getCodeInBlock(block)
      if (result != '') { result += '\n' }
    }
    return result
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

fn.pre = (block, ...inserts) => {
    for (let insert of inserts) {
        _prefix += insert + '\n'
    }
    return ''
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