let quando = window.quando
if (!quando) {
  alert('Fatal Error: ubit must be included after client.js')
}

  let self = quando.ubit = {}
  let last_gesture = ''
  self.last_servo = []
  const SOCKET_IO_URI = "127.0.0.1"
  self.last_orientation = ""

  function connect() {
    self.socket = io(SOCKET_IO_URI)

    self.socket.on("ubit", handle_message)
  }

  connect();

  function dispatch_gesture (gesture_name) {
    if (gesture_name != last_gesture) {
      last_gesture = gesture_name
      quando.dispatch_event(gesture_name)
    }
  }

  self.ubitForward = function (callback) {
    quando.add_handler('ubitForward', callback)
  }

  self.ubitBackward = function (callback) {
    quando.add_handler('ubitBackward', callback)
  }

  self.ubitUp = function (callback) {
    quando.add_handler('ubitUp', callback)
  }

  self.ubitDown = function (callback) {
    quando.add_handler('ubitDown', callback)
  }

  self.ubitLeft = function (callback) {
    quando.add_handler('ubitLeft', callback)
  }

  self.ubitRight = function (callback) {
    quando.add_handler('ubitRight', callback)
  }

  self.ubitA = function (callback) {
    quando.add_handler('ubitA', callback)
  }

  self.ubitB = function (callback) {
    quando.add_handler('ubitB', callback)
  }

  self.ubitP0 = function (callback) {
    quando.add_handler('ubitP0', callback)
  }

  self.ubitP1 = function (callback) {
    quando.add_handler('ubitP1', callback)
  }

  self.ubitP2 = function (callback) {
    quando.add_handler('ubitP2', callback)
  }

  function _handleAngle (event, callback, mid, range, inverted) {
    var scale = quando.new_angle_scaler(mid, range, inverted)
    quando.add_scaled_handler(event, callback, scale)
  }

  self.handleRoll = function (mid, range, inverted, callback) {
    _handleAngle('ubitRoll', callback, mid, range, inverted)
  }

  self.handlePitch = function (mid, range, inverted, callback) {
    _handleAngle('ubitPitch', callback, mid, range, !inverted)
  }

  // self.handleHeading = function (mid, range, inverted, callback) {
  //   _handleAngle('ubitHeading', callback, mid, range, inverted)
  // }

  function handle_message(data) {
    // console.log(data)
    // if (data.ir) {
    //   quando.idle_reset()
    // }
    if (data.orientation) {
      if (data.orientation != self.last_orientation) { // i.e. ignore 'keep alive'
        quando.idle_reset()
      }
      switch (data.orientation) {
        case 'forward':
          dispatch_gesture('ubitForward')
          break
        case 'backward':
          dispatch_gesture('ubitBackward')
          break
        case 'up':
          dispatch_gesture('ubitUp')
          break
        case 'down':
          dispatch_gesture('ubitDown')
          break
        case 'left':
          dispatch_gesture('ubitLeft')
          break
        case 'right':
          dispatch_gesture('ubitRight')
          break
        default:
          last_gesture = '' // this is the micro bit started
      }
    }
    if (data.button_a) {
      quando.idle_reset()
      quando.dispatch_event('ubitA')
    } else if (data.button_b) {
      quando.idle_reset()
      quando.dispatch_event('ubitB')
    } else if (data.button_ab) {
      quando.idle_reset()
      quando.dispatch_event('ubitA')
      quando.dispatch_event('ubitB')
    }
    if (data.pin_0) {
      quando.idle_reset()
      quando.dispatch_event('ubitP0')
    }
    if (data.pin_1) {
      quando.idle_reset()
      quando.dispatch_event('ubitP1')
    }
    if (data.pin_2) {
      quando.idle_reset()
      quando.dispatch_event('ubitP2')
    }
    // if (data.heading) {
    //   quando.idle_reset()
    //   quando.dispatch_event('ubitHeading', {'detail': data.heading})
    //   quando.idle_reset()
    // }
    if (data.roll) {
      quando.idle_reset()
      quando.dispatch_event('ubitRoll', {'detail': data.roll})
    }
    if (data.pitch) {
      quando.idle_reset()
      quando.dispatch_event('ubitPitch', {'detail': data.pitch})
    }
  }

  function _ubit_send(key, val) {
    fetch('/ubit/' + key, { method: 'POST', 
      mode: "no-cors",
      body: JSON.stringify({'val':val}), 
      headers: {"Content-Type": "application/json"}
    })
  }

  self.display = (str) => {
    _ubit_send('display', str)
  }

  self.icon = (index) => {
    _ubit_send('icon', index)
  }

  self.turn = (val, servo, middle, plus_minus, inverted) => {
    if (val === false) { val = 0.5 }
    let min = middle - plus_minus
    let max = middle + plus_minus
    if (inverted) {
      val = 1-val
    }
    let angle = 360 + Math.round(((max - min) * val) + min)
    // add 360 so 0 can be a parsing error for micropython
    let last_angle = self.last_servo[servo]
    if (last_angle != angle) {
      self.last_servo[servo] = angle
      _ubit_send('turn', {'servo':servo+1, 'angle':angle}) // also add 1 to servo for no number aswell
    }
  }