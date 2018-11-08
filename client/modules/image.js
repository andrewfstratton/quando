(() => {
    let quando = this['quando']
    if (!quando) {
        alert('Fatal Error: image.js must be included after quando_browser')
    }

    let self = quando.image = {}
    
    function _redraw() {
        let width_ratio = window.innerWidth / self.current.width
        let height_ratio = window.innerHeight / self.current.height
        let scale = Math.min(width_ratio, height_ratio)
        self.current.style.transform = `scale(${scale})`
    }

    self.startup = () => {
        self.default = document.getElementById('quando_image')
        self.display = document.getElementById('quando_image_display')
        self.current = self.default

        self.default.onload = _redraw
        self.display.onload = _redraw
        document.body.onresize = _redraw
    }

    function _get_image(display) {
        if (display) {
            if (self.current == self.default) {
                self.current = self.display
                self.display.style.visibility = 'visible'
                self.default.style.visibility = 'hidden'
                _redraw()
            }
        } else {
            if (self.current == self.display) {
                self.current = self.default
                self.default.style.visibility = 'visible'
                self.display.style.visibility = 'hidden'
                _redraw()
            }
        }
        return self.current
    }

    self.reset = () => {
        _get_image(false)
    }

    function _set(display, img_address) {
        img_address = '/client/media/' + encodeURI(img_address)
        quando.image_update_video(img_address)
        let elem = _get_image(display)
        elem.src = img_address
    }

    self.set = (img) => {
        _set(true, img)
    }

    self.setDefault = (img) => {
        _set(false, img)
    }

    function _rotate(display, axis, val, mid, range, inverted) {
        let rad = quando.convert_angle(val, mid, range, inverted)
        let rotAxis = `rotate${axis}`
        let elem = document.getElementById('quando_image' + (display?'_display':''))
        let transform = elem.style.transform
        if (transform && transform.includes(rotAxis)) { // need to replace value
            let start = 1 + rotAxis.length + transform.indexOf(rotAxis) // gets past the rotate#(
            let end = transform.indexOf('rad)', start)
            transform = transform.substring(0, start) + rad + transform.substring(end)
        } else {
            if (transform) { // need to append to existing
                transform += " "
            } else { // need to just set - no existing transform
                transform = ''
            }
            transform += `${rotAxis}(${rad}rad)`
        }
        elem.style.transform = transform
    }

    self.roll = (val, mid, range, inverted) => {
        _rotate(true, 'Z', val, mid, range, inverted)
    }

    self.rollDefault = (val, mid, range, inverted) => {
        _rotate(false, 'Z', val, mid, range, inverted)
    }

    self.pitch = (val, mid, range, inverted) => {
        _rotate(true, 'X', val, mid, range, inverted)
    }

    self.pitchDefault = (val, mid, range, inverted) => {
        _rotate(false, 'X', val, mid, range, inverted)
    }

    self.yaw = (val, mid, range, inverted) => {
        _rotate(true, 'Y', val, mid, range, inverted)
    }

    self.yawDefault = (val, mid, range, inverted) => {
        _rotate(false, 'Y', val, mid, range, inverted)
    }

    function _convert_linear(val, mid, range, inverted) {
        if (val === false) { val = 0.5 }
        if (inverted) { val = 1 - val }
        let min = (mid - range)
        let max = (mid + range)
        return min + (val * (max-min))
    }

    function _left_right(display, val, mid, range, inverted) {
        let x = _convert_linear(val, mid, range, inverted)
        let elem = document.getElementById('quando_image' + (display?'_display':''))
        elem.style.left = (x-50)+'%'
        // quando.style.set(style, '#quando_image', 'background-position-x', x + '%');
    }

    self.left_right = (val, mid, range, inverted) => {
        _left_right(true, val, mid, range, inverted)
    }

    self.left_rightDefault = (val, mid, range, inverted) => {
        _left_right(false, val, mid, range, inverted)
    }

    function _up_down(display, val, mid, range, inverted) {
        let y = 100 - _convert_linear(val, mid, range, inverted)
        let elem = document.getElementById('quando_image' + (display?'_display':''))
        elem.style.top = (y-50)+'%'
    }

    self.up_down = (val, mid, range, inverted) => {
        _up_down(true, val, mid, range, inverted)
    }

    self.up_downDefault = (val, mid, range, inverted) => {
        _up_down(false, val, mid, range, inverted)
    }

    function _zoom(style, val, min, max, inverted) {
        if (!val) {
            val = 0; // this forces the minimum value - not the middle
        }
        let mid = (min + max) /2
        let range = (max - min) / 2
        let scale = _convert_linear(val, mid, range, inverted)
        quando.style.set(style, '#quando_image_parent', 'transform', `scale(${scale})`)
    }

    self.zoom = (val, min, max, inverted) => {
        _zoom(quando.style.DISPLAY, val, min, max, inverted)
    }

    self.zoomDefault = (val, min, max, inverted) => {
        _zoom(quando.style.DEFAULT, val, min, max, inverted)
    }
})()