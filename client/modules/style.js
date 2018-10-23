(() => {
    let quando = this['quando']
    if (!quando) {
        alert('Fatal Error: style.js must be included after quando_browser')
    }
    let self = quando.style = {}
    self.DISPLAY = 'quando_css_override'
    self.DEFAULT = 'quando_css'

    self.reset = function () {
        let elem = document.getElementById(self.DISPLAY)
        if (elem != null) {
            if (elem.parentNode) {
                elem.parentNode.removeChild(elem)
            }
        }
    }

    self.set = function (style_id, id, property, value, separator = null) {
        let style = document.getElementById(style_id)
        if (style == null) {
            let styleElem = document.createElement('style')
            styleElem.type = 'text/css'
            styleElem.id = style_id
            document.head.appendChild(styleElem)
            style = styleElem
        }
        if (separator) {
            for (let child of style.childNodes) {
                let data = child.data
                if (data.startsWith(id + ' ')) {
                    data = data.replace(id + ' ', '')
                    if (data.startsWith('{' + property + ': ')) {
                        data = data.replace('{' + property + ': ', '')
                        let endOf = data.lastIndexOf(';}')
                        if (endOf != -1) {
                            data = data.substring(0, endOf)
                            value = data + separator + value // Note - this appends the new property
                        }
                    }
                }
            }
        }
        let rule = '' // overriden anyway
        if (property instanceof Array) {
            for (i in property) {
                rule = id + '{' + property[i] + ': ' + value + ';}\n'
                style.appendChild(document.createTextNode(rule))
            }
        } else {
            rule = id + '{' + property + ': ' + value + ';}\n'
            style.appendChild(document.createTextNode(rule))
        }
    }
})()