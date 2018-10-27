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

    self.set = (style_id, id, property, value, separator = null) => {
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

    function _colour (style, colour) {
        self.set(style, '#body', 'background-color', colour)
    }
    self.colour = (colour) => {
        _colour(self.DISPLAY, colour)
    }
    self.colourDefault = (colour) => {
        _colour(self.DEFAULT, colour)
    }

    function _text (display_default, style, colour) {
        colour = 'rgb('+colour+',0.8)'
        self.set(display_default, '#quando_text', style, colour)
    }
    self.text = (style, colour) => {
        _text(self.DISPLAY, style, colour)
    }
    self.textDefault = (style, colour) => {
        _text(self.DEFAULT, style, colour)
    }

    function _title (display_default, style, colour) {
        colour = 'rgb('+colour+',0.8)'
        self.set(display_default, '#quando_title', style, colour)
    }
    self.title = (style, colour) => {
        _title(self.DISPLAY, style, colour)
    }
    self.titleDefault = (style, colour) => {
        _title(self.DEFAULT, style, colour)
    }

    function _label (display_default, style, colour) {
        self.set(display_default, '.quando_label', style, 'rgb('+colour+',0.6)')
        self.set(display_default, '.quando_label.focus', style, 'rgb('+colour+',1)')
    }
    self.label = (style, colour) => {
        _label(self.DISPLAY, style, colour)
    }
    self.labelDefault = (style, colour) => {
        _label(self.DEFAULT, style, colour)
    }

    function _font_size (display_default, style, chars) {
        let vw = Math.round(100/chars)
        self.set(display_default, style, 'font-size', vw + 'vw')
    }
    self.font_size = (style, chars) => {
        _font_size(self.DISPLAY, style, chars)
    }
    self.font_sizeDefault = (style, chars) => {
        _font_size(self.DEFAULT, style, chars)
    }

    function _font_type (display_default, style, font) {
        self.set(display_default, style, 'font-family', font, ',')
    }
    self.font_type = (style, font) => {
        _font_type(self.DISPLAY, style, font)
    }
    self.font_typeDefault = (style, font) => {
        _font_type(self.DEFAULT, style, font)
    }
})()