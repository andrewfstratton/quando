// Code Generator APIs
// Note: likely (at present) to be browser specific - but should work on the persisted data and (expanded) javascript generator string
(() => {
  let self = this['generator'] = {} // for access from the web page, etc.
  let fn = self.fn = {} // for accessing the invocable generator functions

self.encodeText = (str) => {
  return str.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;')
}

function nextMatch(str, open, close) {
    let [parsed, matched, remaining] = [str, false, false] // fall back when not found
    let index_open = str.indexOf(open)
    if (index_open != -1) { // found
        let left_match = index_open + open.length
        let index_close = str.substring(left_match).indexOf(close)
        if (index_close != -1) { // found
            // so we have  match...
            index_close += left_match
            let right_match = index_close + close.length
            parsed = str.substring(0, index_open)
            matched = str.substring(left_match, index_close)
            remaining = str.substring(right_match)
        }
    }
    return [parsed, matched, remaining]
}

self.getCodeInBlock = function(block) {
    let code = ''
    if (block.dataset.quandoJavascript) {
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
                        value = self.encodeText(child.value)
                    }
                    matches[child.dataset.quandoName] = value
                }
            }
        } else if (row_box.classList.contains("quando-box")) {
            let box_code = ''
            if (row_box.dataset.quandoName) {
                for (let block of row_box.children) {
                    box_code += '\n' + self.getCode(block)
                }
                matches[row_box.dataset.quandoName] = box_code
            }
        }
    }
    matches['data-quando-id'] = block.dataset.quandoId
    matches['$'] = '$'
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
    remaining = code // second pass for $() - parameters are already substituted
    code =''
    while (remaining) {
        [parsed, matched, remaining] = nextMatch(remaining, '$(', ')')
        code += parsed
        if (matched) {
            // split into comma separated
            let params = matched.split(',')
            // parameters need ${} replacement
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
    
self.getCode = function(block) {
    let result = '' 
    if (block.dataset.quandoJavascript) {
      result = self.getCodeInBlock(block) + '\n'
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
fn.displayTitle = (block, display_id) => {
    let result = '----'
    let select = block.querySelector('select[data-quando-name='+display_id+']') // find the select
    if (select) {
        let value = select.value // this is the id
        let option = select.querySelector("option[value='" + value + "']")
        if (option) {
            result = self.encodeText(option.innerHTML)
        }
    }
    return result
}

fn.hasAncestorClass = (block, cls, txt, alt = '') => {
    let check = block
    let found = false
    let result = alt // assume class isn't found
    while (!(found || (check==document))) {
        // i.e. continue until the class is found, or document is the ancestor
        check = check.parentNode
        let type = check && check.dataset && check.dataset.quandoBlockType
        if (type == cls) { // found it...
            result = txt
            found = true
        }
    }
    return result
}

fn.inDisplay = (block, txt, alt) => {
    return fn.hasAncestorClass(block, 'display-when-display', txt, alt)
}

})()