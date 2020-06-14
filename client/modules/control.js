(() => {
  let quando = this['quando']
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

  function decodeText(str) {
    return str.replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
  }

  self.run = (exec) => {
    _send('run', exec)
  }

  self.type = (str) => {
    _send('type', decodeText(str))
  }

  self.key = (ch, press=false, shift=false, ctrl=false, alt=false, command=false) => {
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
    send = {}
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
    // if (mouse.hasOwnProperty('smooth')) {
    //   send.smooth = mouse.smooth
    //   send.valid = true
    //   delete mouse.smooth
    // }
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
})()