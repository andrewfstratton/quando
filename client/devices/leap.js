(function () {
  var quando = this['quando']
  if (!quando) {
    alert('Fatal Error: Leap Motion must be included after quando_browser')
  }
  var self = this['quando_leap'] = {}
  self.leap = new Leap.Controller()
  self.leap.on('connect', function () {
    self.leap.on('frame', self.handler)
  })

  self.handOpen = function (callback, destruct = true) {
    quando.add_handler('leapHandOpen', callback, destruct)
  }

  self.handClosed = function (callback, destruct = true) {
    quando.add_handler('leapHandClosed', callback, destruct)
  }

  function _handleXYZ (event, callback, extras, destruct = true) {
    var scale = quando.new_scaler(extras.min, extras.max, extras.inverted)
    quando.add_scaled_handler(extras.min, extras.max, event, callback, scale, destruct)
  }

  function _handleAngle (event, callback, extras, destruct = true) {
    var scale = quando.new_angle_scaler(extras.mid_angle, extras.plus_minus, extras.inverted)
    quando.add_scaled_handler(0, 360, event, callback, scale, destruct)
  }

  self.handleX = function (callback, extras, destruct = true) {
    _handleXYZ('leapX', callback, extras, destruct)
  }

  self.handleY = function (callback, extras, destruct = true) {
    _handleXYZ('leapY', callback, extras, destruct)
  }

  self.handleZ = function (callback, extras, destruct = true) {
    _handleXYZ('leapZ', callback, extras, destruct)
  }

  self.handleRoll = function (callback, extras, destruct = true) {
    _handleAngle('leapRoll', callback, extras, destruct)
  }

  self.handlePitch = function (callback, extras, destruct = true) {
    _handleAngle('leapPitch', callback, extras, destruct)
  }

  self.handleYaw = function (callback, extras, destruct = true) {
    _handleAngle('leapYaw', callback, extras, destruct)
  }

  function _radians_to_degrees (radians) {
    var degrees = 180 * radians / Math.PI
    return (degrees + 360) % 360 // avoid negative remainder - % is not mod...
  }
  self.last_x = false
  self.last_y = false
  self.last_z = false
  self.last_roll = false
  self.last_pitch = false
  self.last_yaw = false
  self.handler = function (frame) {
    if (frame.hands) {
      if (frame.hands.length >= 1) {
        var hand = frame.hands[0]
        quando.idle_reset()
        var [x, y, z] = hand.palmPosition
        z = -z // make z increase as the hand moves away from the visitor
        if (x != self.last_x) {
          quando.dispatch_event('leapX', {'detail': x})
          self.last_x = x
        }
        if (y != self.last_y) {
          quando.dispatch_event('leapY', {'detail': y})
          self.last_y = y
        }
        if (z != self.last_z) {
          quando.dispatch_event('leapZ', {'detail': z})
          self.last_z = z
        }
        var roll = _radians_to_degrees(-hand.roll())
        if (roll != self.last_roll) {
          quando.dispatch_event('leapRoll', {'detail': roll})
          self.last_roll = roll
        }
        var pitch = _radians_to_degrees(hand.pitch())
        if (pitch != self.last_pitch) {
          quando.dispatch_event('leapPitch', {'detail': pitch})
          self.last_pitch = pitch
        }
        var yaw = _radians_to_degrees(hand.yaw())
        if (yaw != self.last_yaw) {
          quando.dispatch_event('leapYaw', {'detail': yaw})
          self.last_yaw = yaw
        }
        var strength = hand.grabStrength
        if (strength == 1) {
          quando.dispatch_event('leapHandClosed')
        } else if (strength == 0) {
          quando.dispatch_event('leapHandOpen')
        }
      }
    }
  }

  self.leap.connect()
})()
