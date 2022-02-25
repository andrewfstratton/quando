import * as text from "/common/text.js";

let quando = window['quando']
if (!quando) {
  alert('Fatal Error: Control must be included after quando_browser')
}

  let self = quando.control = {}
  let mouse = {}

  function _send(command, arg) {
    fetch('/control/' + command, { method: 'POST', 
      mode: "no-cors",
      body: JSON.stringify(arg), 
      headers: ({"Content-Type": "text/plain"})
    })
  }

  self.type = (str) => {
    _send('type', text.decode(str))
  }

  self.key = (ch, up_down, on_off) => {
    // ch is a character, or character description string
    let press = false
    switch (up_down) {
      case 'down':
        press = true
        break
        case 'either':
          if (on_off && (on_off > 0.5)) {
            press = true
          }
    }
    let data = {'key':ch, 'press':press}
    _send('key', data)
  }

  self.mouseX = (x, smooth=false) => {
    mouse.x = x
    mouse.smooth = smooth
  }

  self.mouseY = (y, smooth=false) => {
    mouse.y = y
    mouse.smooth = smooth
  }

  self.mouseClick = (button, up_down, val) => {
    let press = up_down // this handles up/down/click
    if (up_down == 'either') {
      press = "up"
      if (val!=0) {
         press = "down"
      }
    }
    if (button == 'left') {
      mouse.left = press
    }
    if (button == 'middle') {
      mouse.middle = press
    }
    if (button == 'right') {
      mouse.right = press
    }
    _updateMouse() // do now to avoid race with key press
  }

  function _updateMouse() {
    let send = {}
    if (mouse.hasOwnProperty('x')) {
      send.x = mouse.x
      send.valid = true
      delete mouse.x
    }
    if (mouse.hasOwnProperty('y')) {
      send.y = mouse.y
      send.valid = true
      delete mouse.y
    }
    if (mouse.hasOwnProperty('left')) {
      send.left = mouse.left
      send.valid = true
      delete mouse.left
    }
    if (mouse.hasOwnProperty('middle')) {
      send.middle = mouse.middle
      send.valid = true
      delete mouse.middle
    }
    if (mouse.hasOwnProperty('right')) {
      send.right = mouse.right
      send.valid = true
      delete mouse.right
    }
    if (send.valid) {
      delete send.valid
      _send('mouse', send)
    }
  }

  setInterval(_updateMouse, 1/30 * 1000) // 30 times per second