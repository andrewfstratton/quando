(function () {
  let quando = this['quando']
  if (!quando) {
    alert('Fatal Error: ubit must be included after quando_browser')
  }
  let self = quando.ubit = {}
  self.last_gesture = ''
  self.last_servo = []

  function dispatch_gesture (gesture_name) {
    if (gesture_name != self.last_gesture) {
      self.last_gesture = gesture_name
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

  function _handleAngle (event, callback, mid, range, inverted) {
    var scale = quando.new_angle_scaler(mid, range, inverted)
    quando.add_scaled_handler(event, callback, scale)
  }

  self.handleRoll = function (mid, range, inverted, callback) {
    _handleAngle('ubitRoll', callback, mid, range, inverted)
  }

  self.handlePitch = function (mid, range, inverted, callback) {
    _handleAngle('ubitPitch', callback, mid, range, inverted)
  }

  self.handleHeading = function (mid, range, inverted, callback) {
    _handleAngle('ubitHeading', callback, mid, range, !inverted) // heading inversion is inverted ?!
  }

  quando.socket.on('ubit', function (data) {
    if (data.ir) {
      quando.idle_reset()
    } else if (data.orientation) {
      quando.idle_reset() // this is only received when the orientation changes
      if (data.orientation == 'forward') {
        dispatch_gesture('ubitForward')
      } else if (data.orientation == 'backward') {
        dispatch_gesture('ubitBackward')
      } else if (data.orientation == 'up') {
        dispatch_gesture('ubitUp')
      } else if (data.orientation == 'down') {
        dispatch_gesture('ubitDown')
      } else if (data.orientation == 'left') {
        dispatch_gesture('ubitLeft')
      } else if (data.orientation == 'right') {
        dispatch_gesture('ubitRight')
      } else if (data.orientation == '') { // this is the micro bit started
          self.last_gesture = ''
        }
    } else if (data.button) {
      quando.idle_reset()
      if (data.button == 'a') {
        quando.dispatch_event('ubitA')
      }
      if (data.button == 'b') {
        quando.dispatch_event('ubitB')
      }
    } else if (data.heading) {
      quando.idle_reset()
      quando.dispatch_event('ubitHeading', {'detail': data.heading})
    } else if (data.roll || data.pitch) {
      if (data.roll) {
        quando.dispatch_event('ubitRoll', {'detail': data.roll})
      }
      if (data.pitch) {
        quando.dispatch_event('ubitPitch', {'detail': data.pitch})
      }
      quando.idle_reset()
    }
  })

  function _ubit_send(key, val) {
    fetch('/ubit/'+key, { method: 'POST', 
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
    let angle = 90 + Math.round(((max - min) * val) + min)
    // angle becomes 0..180
    let last_angle = self.last_servo[servo]
    if (last_angle != angle) {
      self.last_servo[servo] = angle
      let snd = [servo, angle]
      _ubit_send('turn', snd) 
    }
  }
})()