let quando = window['quando']
if (!quando) {
  alert('Fatal Error: mouse_control must be included after quando_browser')
}

  let self = quando.mouse_control = {}
  let mouse = {}

  function _send(arg) {
    fetch('/control/mouse', { method: 'POST', 
      mode: "no-cors",
      body: JSON.stringify(arg), 
      headers: ({"Content-Type": "text/plain"})
    })
  }

  self.moveX = ({val, inverted = false, limited=true, time, relative = false}) => {
    if (inverted) { val = 1-val }
    mouse.x = val
    if (relative) {
      mouse.relative = true
      mouse.time = time
      mouse.limited = limited
    }
  }

  self.moveY = ({val, inverted = false, limited=true, time, relative = false}) => {
    if (inverted) { val = 1-val }
    mouse.y = val
    if (relative) {
      mouse.relative = true
      mouse.time = time
      mouse.limited = limited
    }
  }

  self.click = (button, up_down, val) => {
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
      delete mouse.x
    }
    if (mouse.hasOwnProperty('y')) {
      send.y = mouse.y
      delete mouse.y
    }
    if (mouse.hasOwnProperty('time')) {
      send.time = mouse.time
      delete mouse.time
    }
    if (mouse.hasOwnProperty('limited')) {
      send.limited = mouse.limited
      delete mouse.limited
    }
    if (mouse.hasOwnProperty('relative')) {
      send.relative = mouse.relative
      delete mouse.relative
    }
    if (mouse.hasOwnProperty('left')) {
      send.left = mouse.left
      delete mouse.left
    }
    if (mouse.hasOwnProperty('middle')) {
      send.middle = mouse.middle
      delete mouse.middle
    }
    if (mouse.hasOwnProperty('right')) {
      send.right = mouse.right
      delete mouse.right
    }
    if (Object.keys(send).length) { //  i.e. something has been set
      // console.log("send="+JSON.stringify(send))
      _send(send)
    }
  }

  setInterval(_updateMouse, 1/30 * 1000) // 30 times per second