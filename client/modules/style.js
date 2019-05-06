(() => {
    let quando = this['quando']
    if (!quando) {
        alert('Fatal Error: style.js must be included after client.js')
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
        quando.image.reset()
    }

    self.get = (style_id, id, property) => {
        let style = document.getElementById(style_id)
        let result = false
        for (let rule of style.sheet.cssRules) {
            let css = rule.cssText
            if (css.startsWith(id + ' { ')) {
                css = css.replace(id + ' { ', '') // strip the id prefix
                if (css.startsWith(property + ': ')) {
                    css = css.replace(property + ': ', '') // strip the property prefix
                    let endOf = css.lastIndexOf('; }')
                    if (endOf != -1) {
                        result = css.substring(0, endOf)
                        break
                    }
                }
            }
        }
        return result
    }

    self.set = (style_id, id, property, value) => {
        let style = document.getElementById(style_id)
        if (style == null) {
            let styleElem = document.createElement('style')
            styleElem.type = 'text/css'
            styleElem.id = style_id
            document.head.appendChild(styleElem)
            style = styleElem
        } // now replace...
        let cssRules = style.sheet.cssRules
        let replaced = false
        for (let rule = 0; rule < cssRules.length; rule++) {
            if (cssRules[rule].cssText.startsWith(`${id} { ${property}: `)) {
                if (replaced) {
                    style.sheet.deleteRule(rule) // delete all other matching rules - should never happen
                } else {
                    cssRules[rule].style[property] = value
                    replaced = true
                }
            }
        }
        if (!replaced) {
            style.sheet.insertRule(`${id} { ${property}: ${value}; }`, 0)
        }
    }

    self.colour = (display, colour) => {
        self.set(display, '#body', 'background-color', colour)
    }

    self.text = (display, style, colour) => {
        self.set(display, '#quando_text', style, 'rgb('+colour+',0.8)')
    }

    self.title = (display, style, colour) => {
        self.set(display, '#quando_title', style, 'rgb('+colour+',0.8)')
    }

    self.label = (display, style, colour) => {
        self.set(display, '.quando_label', style, 'rgb('+colour+',0.6)')
        self.set(display, '.quando_label.focus', style, 'rgb('+colour+',1)')
    }

    self.font_size = (display, style, chars) => {
        let vw = Math.round(100/chars)
        self.set(display, style, 'font-size', vw + 'vw')
    }

    self.font_type = (display, style, font) => {
        self.set(display, style, 'font-family', font, ',')
    }

    self.cursor_colour = (display, colour, opacity) => {
        self.set(display, '#cursor', 'background-color', `rgba(${colour}, ${opacity/100})`)
    }

    self.cursor_size = (display, percent) => {
        self.set(display, '#cursor', 'width', `${percent}vw`)
        self.set(display, '#cursor', 'height', `${percent}vw`)
        self.set(display, '#cursor', 'margin-left', `${percent/2}vw`)
        self.set(display, '#cursor', 'margin-top', `${percent/2}vw`)
    }

    self.position = (display, type, direction, percent) => {
        let style = display?self.DISPLAY:self.DEFAULT
        self.set(style, `#quando_${type}`, direction, `${percent}%`)
    }

    self.size = (display, type, direction, percent) => {
        let style = display?self.DISPLAY:self.DEFAULT
        self.set(style, `#quando_${type}`, direction, `${percent}%`)
    }
})()