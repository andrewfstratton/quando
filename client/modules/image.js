(() => {
    let quando = this['quando']
    if (!quando) {
        alert('Fatal Error: style.js must be included after quando_browser')
    }
    let self = quando.image = {}

    function _image(style, img) {
        img = '/client/media/' + encodeURI(img)
        quando.image_update_video(img)
        quando.style.set(style, '#quando_image', 'background-image', 'url('+img+')')
    }

    self.set = (img) => {
        _image(quando.style.DISPLAY, img)
    }

    self.setDefault = (img) => {
        _image(quando.style.DEFAULT, img)
    }

    function _rotate(style, axis, val, mid, range, inverted) {
        let rad = quando.convert_angle(val, mid, range, inverted)
        quando.style.set(style, '#quando_image', 'transform', `rotate${axis}(${rad}rad)`);
    }

    self.roll = (val, mid, range, inverted) => {
        _rotate(quando.style.DISPLAY, 'Z', val, mid, range, inverted)
    }

    self.rollDefault = (val, mid, range, inverted) => {
        _rotate(quando.style.DEFAULT, 'Z', val, mid, range, inverted)
    }

    self.pitch = (val, mid, range, inverted) => {
        _rotate(quando.style.DISPLAY, 'X', val, mid, range, inverted)
    }

    self.pitchDefault = (val, mid, range, inverted) => {
        _rotate(quando.style.DEFAULT, 'X', val, mid, range, inverted)
    }

    self.yaw = (val, mid, range, inverted) => {
        _rotate(quando.style.DISPLAY, 'Y', val, mid, range, inverted)
    }

    self.yawDefault = (val, mid, range, inverted) => {
        _rotate(quando.style.DEFAULT, 'Y', val, mid, range, inverted)
    }

})()