(function () {
  var quando = this['quando']
  if (!quando) {
    alert('Fatal Error: Leap Motion must be included after quando_browser')
  }
  var self = quando.leap = {}
  self.controller = new Leap.Controller({background:true})
  self.controller.on('connect', function () {
    self.controller.on('frame', self.handler)
  })

  self.handOpen = function (hand, callback) {
    quando.add_handler('leapHandOpen' + hand, callback)
  }

  self.handClosed = function (hand, callback) {
    quando.add_handler('leapHandClosed' + hand, callback)
  }

  self.handleGrip = (hand, min, max, inverted, callback) => {
    let scale = quando.new_scaler(min/100, max/100, inverted) // min and max are percent
    quando.add_scaled_handler('leapHandGrip' + hand, callback, scale)
  }

  function _handleXYZ (event, min, max, inverted, callback) {
    var scale = quando.new_scaler(min, max, inverted)
    quando.add_scaled_handler(event, callback, scale)
  }

  function _handleAngle (event, mid_angle, plus_minus, inverted, callback) {
    var scale = quando.new_angle_scaler(mid_angle, plus_minus, inverted)
    quando.add_scaled_handler(event, callback, scale)
  }

  self.handleX = function (hand, range, inverted, callback) {
    let max = range*10
    let min = -max
    if ((hand == "Left") || (hand == "Right")) {
      min = 75 // i.e. 7.5 cm
      max += min // the range is effectively half for each hand
      if (hand == "Left") {
        min = -max
        max = -75
      }
    }
    self.bounds.x = { max: max, min: min, range: max - min }
    _handleXYZ('leapX' + hand, min, max, inverted, callback)
  }

  self.handleY = function (hand, range, inverted, callback) {
    let min = 200 // 20cm
    let max = min + 20*range
    self.bounds.y = { max: max, min: min, range: max - min }
    _handleXYZ('leapY' + hand, min, max, inverted, callback)
  }

  self.handleZ = function (hand, range, inverted, callback) {
    self.bounds.y = { max: range*10, min: -range*10, range: range }
    _handleXYZ('leapZ' + hand, -range*10, range*10, inverted, callback)
  }

  self.handleRoll = function (hand, mid_angle, plus_minus, inverted, callback) {
    _handleAngle('leapRoll' + hand, mid_angle, plus_minus, inverted, callback)
  }

  self.handlePitch = function (hand, mid_angle, plus_minus, inverted, callback) {
    _handleAngle('leapPitch' + hand, mid_angle, plus_minus, inverted, callback)
  }

  self.handleYaw = function (hand, mid_angle, plus_minus, inverted, callback) {
    _handleAngle('leapYaw' + hand, mid_angle, plus_minus, inverted, callback)
  }

  self.setBoundsBehaviour = function (hand, backToMiddle, tolerance, ignore) {
    self.bounds.tolerance = Number(tolerance) / 100;
    console.log(self.bounds.tolerance)
    if (backToMiddle === "true") {
      return self.ignore_all = true;
    }
    switch (ignore) {
      case "all":
        self.ignore.move = true;
        self.ignore.rotate = true;
        self.ignore.grip = true;
        break;
      case "move":
        self.ignore.move = true;
        break;
      case "rotate":
        self.ignore.rotate = true;
        break;
      case "grip":
        self.ignore.grip = true;
        break;
      case "move_rotate":
        self.ignore.move = true;
        self.ignore.rotate = true;
        break;
      case "move_grip":
        self.ignore.move = true;
        self.ignore.grip = true;
        break;
      case "rotate_grip":
        self.ignore.rotate = true;
        self.ignore.grip = true;
        break;
      default:
        self.ignore.move = false;
        self.ignore.rotate = false;
        self.ignore.grip = false;
        break;
    }
  }

  function _radians_to_degrees (radians) {
    var degrees = 180 * radians / Math.PI
    return (degrees + 360) % 360 // avoid negative remainder - % is not mod...
  }

  let _isOutOfBounds = (x, y, z, bounds) => {
    if (bounds.x) {
      if (x < (bounds.x.min - bounds.x.range * bounds.tolerance) 
        || x > (bounds.x.max + bounds.x.range * bounds.tolerance)
      ) return true;
    }
    if (bounds.y) {
      if (y < (bounds.y.min - bounds.y.range * bounds.tolerance) 
        || y > (bounds.y.max + bounds.y.range * bounds.tolerance)
      ) return true;
    }
    if (bounds.z) {
      if (z < (bounds.z.min - bounds.z.range * bounds.tolerance) 
        || z > (bounds.z.max + bounds.z.range * bounds.tolerance)
      ) return true;
    }
    return false;
  }
  
  self.ignore_all = false
  self.ignore = { 'move': false, 'rotate': false, 'grip': false }
  self.out_of_bounds = false
  self.bounds = {}
  self.last_x = { 'Left': false, 'Right': false }
  self.last_y = { 'Left': false, 'Right': false }
  self.last_z = { 'Left': false, 'Right': false }
  self.last_roll = { 'Left': false, 'Right': false }
  self.last_pitch = { 'Left': false, 'Right': false }
  self.last_yaw = { 'Left': false, 'Right': false }
  self.last_flat = { 'Left': false, 'Right': false }
  self.last_grip = { 'Left': false, 'Right': false }
  self.handler = function (frame) {

    if (frame.hands) {
      if (frame.hands.length >= 1) {
        for (hand of frame.hands) {
          quando.idle_reset()
          if (hand.confidence == 1) {
            var [x, y, z] = hand.palmPosition
            var type = hand.type.charAt(0).toUpperCase() + hand.type.slice(1)
            z = -z // make z increase as the hand moves away from the visitor
            if (_isOutOfBounds(x, y, z, self.bounds)) {
              self.out_of_bounds = true
              console.log("oob")
            } else {
              self.out_of_bounds = false
            }
            if (!(self.out_of_bounds && self.ignore.move)) {
              console.log("moving")
              if (x != self.last_x[type]) {
                quando.dispatch_event('leapX' + type, {'detail': x})
                quando.dispatch_event('leapXEither', {'detail': x})
                self.last_x[type] = x
              }
              if (y != self.last_y[type]) {
                quando.dispatch_event('leapY' + type, {'detail': y})
                quando.dispatch_event('leapYEither', {'detail': y})
                self.last_y[type] = y
              }
              if (z != self.last_z[type]) {
                quando.dispatch_event('leapZ' + type, {'detail': z})
                quando.dispatch_event('leapZEither', {'detail': z})
                self.last_z[type] = z
              }
            }
            if (!(self.out_of_bounds && self.ignore.rotate)) {
              var roll = _radians_to_degrees(-hand.roll())
              if (roll != self.last_roll[type]) {
                quando.dispatch_event('leapRoll' + type, {'detail': roll})
                quando.dispatch_event('leapRollEither', {'detail': roll})
                self.last_roll[type] = roll
              }
              var pitch = _radians_to_degrees(hand.pitch())
              if (pitch != self.last_pitch[type]) {
                quando.dispatch_event('leapPitch' + type, {'detail': pitch})
                quando.dispatch_event('leapPitchEither', {'detail': pitch})
                self.last_pitch[type] = pitch
              }
              var yaw = _radians_to_degrees(hand.yaw())
              if (yaw != self.last_yaw[type]) {
                quando.dispatch_event('leapYaw' + type, {'detail': yaw})
                quando.dispatch_event('leapYawEither', {'detail': yaw})
                self.last_yaw[type] = yaw
              }
            }
            if (!(self.out_of_bounds && self.ignore.grip)) {
              var strength = hand.grabStrength
              if (strength == 1 && self.last_flat[type]) {
                quando.dispatch_event('leapHandClosed' + type)
                quando.dispatch_event('leapHandClosedEither')
                self.last_flat[type] = false
              }
              if (strength <= 0.9 && !self.last_flat[type]) {
                quando.dispatch_event('leapHandOpen' + type)
                quando.dispatch_event('leapHandOpenEither')
                self.last_flat[type] = true
              }
              if (strength != self.last_grip[type]) {
                quando.dispatch_event('leapHandGrip' + type, {'detail': strength})
                quando.dispatch_event('leapHandGripEither', {'detail': strength})
                self.last_grip[type] = strength
              }
            }
          }
        }
      }
    }
  }

  self.controller.connect()
})()
