let quando = window.quando
if (!quando) {
  alert('Fatal Error: ubit must be included after client.js')
}

  let self = quando.ubit = {}
  let last_data = {}
  self.last_servo = [] // FIX change to let

  function _add_handle_change(down_up, event_name, callback) {
    switch (down_up) {
      case 'up':
        quando.add_handler(event_name, (ev) => {
          let up_down = ev.detail
          if (up_down == 'up') {
            callback()
          }
        })
        break
      case 'down':
        quando.add_handler(event_name, (ev) => {
          let up_down = ev.detail
          if (up_down == 'down') {
            callback()
          }
        })
        break
      case 'change':
        quando.add_handler(event_name, (ev) => {
          let val = 0
          if (ev.detail == 'down') {
            val = 1
          }
          callback(val)
        })
        break
      default:
        console.log("Unknown up_down status of '" + up_down + "'")
    }
  }

  self.handleButtonPin = (button_pin, down_up, callback) => {
    let event_name = "ubit"
    switch (button_pin) {
      case 'a':
        event_name += "A"
        break
      case 'b':
        event_name += "B"
        break
      case 'pin0':
        event_name += "P0"
        break
      case 'pin1':
        event_name += "P1"
        break
      case 'pin2':
        event_name += "P2"
        break
      default:
        console.log("button_pin incorrectly passed as " + button_pin)
    }
    _add_handle_change(down_up, event_name, callback)
  }

  self.handleDirection = (direction, down_up, callback) => {
    let event_name = "ubit"
    switch (direction) {
      case 'up':
        event_name += "Up"
        break
      case 'down':
        event_name += "Down"
        break
      case 'forward':
        event_name += "Forward"
        break
      case 'backward':
        event_name += "Backward"
        break
      case 'left':
        event_name += "Left"
        break
      case 'right':
        event_name += "Right"
        break
      default:
        console.log("direction incorrectly passed as " + button_pin)
    }
    _add_handle_change(down_up, event_name, callback)
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

  function _data_to_event_name(data) {
    let name = ''
    switch (data) {
      case 'forward':
        name = 'ubitForward'
        break
      case 'backward':
        name = 'ubitBackward'
        break
      case 'up':
        name = 'ubitUp'
        break
      case 'down':
        name = 'ubitDown'
        break
      case 'left':
        name = 'ubitLeft'
        break
      case 'right':
        name = 'ubitRight'
        break
    }
    return name
  }

  function _dispatch_up_down(new_data, old_data, event_name) {
    if (new_data != old_data) { // must have a new value
      let up_down = 'up'
      if (new_data) {
        up_down = 'down'
      }
      quando.dispatch_event(event_name, {'detail': up_down})
    }
  }

  self.handle_message = (data) => {
    // console.log(data)
    if (data.orientation) {
      if (data.orientation != last_data.orientation) {
        let last_event_name = _data_to_event_name(last_data.orientation)
        let new_event_name = _data_to_event_name(data.orientation)
        if (last_event_name != new_event_name) {
          if (last_event_name != '') {
            quando.dispatch_event(last_event_name, {'detail': 'up'})
            // console.log(last_event_name + ':up')
          }
          if (new_event_name != '') {
            quando.dispatch_event(new_event_name, {'detail': 'down'})
            // console.log(last_event_name + ':down')
          }
        }
      }
    }
    _dispatch_up_down(data.button_a, last_data.button_a, "ubitA")
    _dispatch_up_down(data.button_b, last_data.button_b, "ubitB")
    _dispatch_up_down(data.pin_0, last_data.pin_0, "ubitP0")
    _dispatch_up_down(data.pin_1, last_data.pin_1, "ubitP1")
    _dispatch_up_down(data.pin_2, last_data.pin_2, "ubitP2")
    if (data.roll) {
      quando.idle_reset()
      quando.dispatch_event('ubitRoll', {'detail': data.roll})
    }
    if (data.pitch) {
      quando.idle_reset()
      quando.dispatch_event('ubitPitch', {'detail': data.pitch})
    }
    quando.idle_reset()
    last_data = data
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
      _ubit_send('turn', {'servo':servo+1, 'angle':angle}) // also add 1 to servo for no number as well
    }
  }