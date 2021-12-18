(() => {
    let quando = this['quando']
    if (!quando) {
        alert('Fatal Error: image.js must be included after client.js')
    }

    let self = quando.image = {}
    self.current = false
    
    function _get_image(display) {
        let def = document.getElementById('quando_image')
        let dis = document.getElementById('quando_image_display')
        if (!self.current) {
            self.current = display?def:dis
        }
        if (display) {
            if (self.current == def) {
                self.current = dis
                dis.style.visibility = 'visible'
                def.style.visibility = 'hidden'
            }
        } else {
            if (self.current == dis) {
                self.current = def
                def.style.visibility = 'visible'
                dis.style.visibility = 'hidden'
            }
        }
        return self.current
    }

    self.reset = () => {
        _get_image(false)
    }

    self.set = (display, img_address) => {
        if (img_address) {
            img_address = '/client/media/' + encodeURI(img_address)
        } else {
            img_address = '/client/transparent.png'
        }
        // Stop any video as well so the image is visible straightaway
        quando.media.clear_video()
        let elem = _get_image(display)
        elem.src = img_address
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

    self.roll = (display, val, mid, range, inverted) => {
        _rotate(display, 'Z', val, mid, range, inverted)
    }

    self.pitch = (display, val, mid, range, inverted) => {
        _rotate(display, 'X', val, mid, range, inverted)
    }

    self.yaw = (display, val, mid, range, inverted) => {
        _rotate(display, 'Y', val, mid, range, inverted)
    }

    self.left_right = (display, val, mid, range, inverted) => {
        let x = quando.convert_linear(val, mid, range, inverted) - 50
        let elem = document.getElementById('quando_image' + (display?'_display':''))
        if (x<0) { x *= 2 }
        elem.style.left = x+'%'
    }

    self.up_down = (display, val, mid, range, inverted) => {
        inverted = !inverted // so up is bigger
        let y = quando.convert_linear(val, mid, range, inverted)
        let elem = document.getElementById('quando_image' + (display?'_display':''))
        y *= 2
        if (y<0) { y *= 2 }
        elem.style.top = (y-100)+'%'
    }

    self.zoom = (display, val, min, max, inverted) => {
        if (val === false) {
            val = 0; // this forces the minimum value - not the middle
        }
        let mid = (min + max) /2
        let range = (max - min) / 2
        let scale = quando.convert_linear(val, mid, range, inverted)
        let elem = document.getElementById('quando_image' + (display?'_display':''))
        elem.style.transform = `scale(${scale})`
        elem.dataset.quandoZoom = scale // save the zoom for later - simpler than calculating
    }

    self.scroll = (display, val, x_not_y, inverted) => {
        let elem = document.getElementById('quando_image' + (display?'_display':''))
        let zoom = 1
        if (elem.dataset && elem.dataset.quandoZoom) {
            zoom = elem.dataset.quandoZoom
        }
        let rect = elem.getBoundingClientRect()
        if (x_not_y) { // scroll <>, i.e. left..right
            let mid = (rect.right - rect.left)/2
            let range = mid
            let x = quando.convert_linear(val, mid, range, 1-inverted) - mid
            if (x < 0) { x *= 2 }
            elem.style.left = x+'px'
        } else { // scroll v^, i.e. down..up
            let height = rect.bottom - rect.top
            let mid = height/2
            let range = mid
            let y = quando.convert_linear(val, mid, range, 1-inverted) - mid
            y *= 2
            // if (y > 0) { y *= 2 }
            elem.style.top = y+'px'
        }
    }

})()