(function () {
  var quando = this['quando']
  if (!quando) {
    alert('Fatal Error: ubit must be included after quando_browser')
  }
  var self = quando.ubit = {}
  self.last_gesture = ''

  function dispatch_gesture (gesture_name) {
    if (gesture_name != self.last_gesture) {
      self.last_gesture = gesture_name
      quando.dispatch_event(gesture_name)
    }
  }

  self.ubitForward = function (callback, destruct = true) {
    quando.add_handler('ubitForward', callback, destruct)
  }

  self.ubitBackward = function (callback, destruct = true) {
    quando.add_handler('ubitBackward', callback, destruct)
  }

  self.ubitUp = function (callback, destruct = true) {
    quando.add_handler('ubitUp', callback, destruct)
  }

  self.ubitDown = function (callback, destruct = true) {
    quando.add_handler('ubitDown', callback, destruct)
  }

  self.ubitLeft = function (callback, destruct = true) {
    quando.add_handler('ubitLeft', callback, destruct)
  }

  self.ubitRight = function (callback, destruct = true) {
    quando.add_handler('ubitRight', callback, destruct)
  }

  self.ubitA = function (callback, destruct = true) {
    quando.add_handler('ubitA', callback, destruct)
  }

  self.ubitB = function (callback, destruct = true) {
    quando.add_handler('ubitB', callback, destruct)
  }

  function _handleAngle (event, callback, extras, destruct = true) {
    var scale = quando.new_angle_scaler(extras.mid_angle, extras.plus_minus, extras.inverted)
    quando.add_scaled_handler(event, callback, scale, destruct)
  }

  self.handleRoll = function (callback, extras = {}, destruct = true) {
    _handleAngle('ubitRoll', callback, extras, destruct)
  }

  self.handlePitch = function (callback, extras = {}, destruct = true) {
    _handleAngle('ubitPitch', callback, extras, destruct)
  }

  self.handleHeading = function (callback, extras = {}, destruct = true) {
    _handleAngle('ubitHeading', callback, extras, destruct)
  }

  self.handleMagX = function(callback, extras={}, destruct=true) {
    var scale = quando.new_scaler(extras.mid_angle - extras.plus_minus, extras.mid_angle + extras.plus_minus,
      extras.inverted)
    quando.add_scaled_handler("ubitMagX", callback, scale, destruct)
  }

  self.handleMagY = function(callback, extras={}, destruct=true) {
    var scale = quando.new_scaler(extras.mid_angle - extras.plus_minus, extras.mid_angle + extras.plus_minus,
      extras.inverted)
    quando.add_scaled_handler("ubitMagY", callback, scale, destruct)
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
          last_gesture = ''
        }
    } else if (data.button) {
      quando.idle_reset()
      if (data.button == 'a') {
        quando.dispatch_event('ubitA')
      }
      if (data.button == 'b') {
        quando.dispatch_event('ubitB')
      }
    } else if (data.mag_x || data.mag_y) {
      quando.dispatch_event('ubitMagX', {'detail': data.mag_x})
      quando.dispatch_event('ubitMagY', {'detail': data.mag_y})
      quando.idle_reset()
    } else if (data.heading) {
      quando.dispatch_event('ubitHeading', {'detail': data.heading})
      quando.idle_reset()
    } else if (data.roll || data.pitch) {
      if (data.roll) {
        var roll = data.roll * 180 / Math.PI
        if (roll < 0) {
          roll += 360
        }
        quando.dispatch_event('ubitRoll', {'detail': roll})
      }
      if (data.pitch) {
        var pitch = data.pitch * 180 / Math.PI
        if (pitch < 0) {
          pitch += 360
        }
        quando.dispatch_event('ubitPitch', {'detail': pitch})
      }
      quando.idle_reset()
    }
  })
})()
