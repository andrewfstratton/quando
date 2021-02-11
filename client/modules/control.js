import * as text from "/common/text.js";

let quando = window['quando']
if (!quando) {
  alert('Fatal Error: Control must be included after quando_browser')
}

  let self = quando.control = {}
  let mouse = {}

  function _send(command, arg) {
    fetch('http://localhost:8080/control/' + command, { method: 'POST', 
      mode: "no-cors",
      body: JSON.stringify({'val':arg}), 
      headers: {"Content-Type": "application/json"}
    })
  }

  self.run = (exec) => {
    _send('run', exec)
  }

  self.type = (str) => {
    _send('type', text.decode(str))
  }

  self.key = (coded_char, press=false) => {
    // coded_char is a string representing shift/ctrl/alt/command and a character, where a +/' ' indicate
    // whether the modifier key needs to be included
    let shift = coded_char[0] == '+'
    let ctrl = coded_char[1] == '+'
    let alt = coded_char[2] == '+'
    let command = coded_char[3] == '+'
    let ch = coded_char.slice(4)
    let val = {'key':ch, 'press':press, 'shift':shift, 'ctrl':ctrl, 'alt':alt, 'command':command}
    _send('key', val)
  }

  self.mouseX = (x, smooth=false) => {
    mouse.x = x
    mouse.smooth = smooth
  }

  self.mouseY = (y, smooth=false) => {
    mouse.y = y
    mouse.smooth = smooth
  }

  self.mouseClick = (button, press=false) => {
    let pressCode = press?1:-1 // 1 for press, -1 for release, 0 could be false...
    if (button == 'left') {
      mouse.left = pressCode
    }
    if (button == 'middle') {
      mouse.middle = pressCode
    }
    if (button == 'right') {
      mouse.right = pressCode
    }
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

  setInterval(_updateMouse, 1/20 * 1000) // 20 times per second