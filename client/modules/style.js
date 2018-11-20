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

    function createDefaultDisplay(name, fn) {
        self[name] = (...args) => { fn(self.DISPLAY, ...args) }
        self[name+'Default'] = (...args) => { fn(self.DEFAULT, ...args) }
    }

    createDefaultDisplay('colour', (display_default, colour) => {
        self.set(display_default, '#body', 'background-color', colour)
    })

    createDefaultDisplay('text', (display_default, style, colour) => {
        colour = 'rgb('+colour+',0.8)'
        self.set(display_default, '#quando_text', style, colour)
    })

    createDefaultDisplay('title', (display_default, style, colour) => {
        colour = 'rgb('+colour+',0.8)'
        self.set(display_default, '#quando_title', style, colour)
    })

    createDefaultDisplay('label', (display_default, style, colour) => {
        self.set(display_default, '.quando_label', style, 'rgb('+colour+',0.6)')
        self.set(display_default, '.quando_label.focus', style, 'rgb('+colour+',1)')
    })

    createDefaultDisplay('font_size', (display_default, style, chars) => {
        let vw = Math.round(100/chars)
        self.set(display_default, style, 'font-size', vw + 'vw')
    })

    createDefaultDisplay('font_type', (display_default, style, font) => {
        self.set(display_default, style, 'font-family', font, ',')
    })

    createDefaultDisplay('cursor_colour', (display_default, colour, opacity) => {
        self.set(display_default, '#cursor', 'background-color', `rgba(${colour}, ${opacity/100})`)
    })

    createDefaultDisplay('cursor_size', (display_default, percent) => {
        self.set(display_default, '#cursor', 'width', `${percent}vw`)
        self.set(display_default, '#cursor', 'height', `${percent}vw`)
        self.set(display_default, '#cursor', 'margin-left', `${percent/2}vw`)
        self.set(display_default, '#cursor', 'margin-top', `${percent/2}vw`)
    })
})()