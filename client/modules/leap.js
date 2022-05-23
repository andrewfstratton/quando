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
    console.log(range*10)
    self.bounds.x = { max: max, min: min, range: max - min, mid: min + (max - min)/2 }
    _handleXYZ('leapX' + hand, min, max, inverted, callback)
  }

  self.handleY = function (hand, range, inverted, callback) {
    let min = 200 // 20cm
    let max = min + 20*range
    self.bounds.y = { max: max, min: min, range: max - min, mid: min + (max - min)/2 }
    _handleXYZ('leapY' + hand, min, max, inverted, callback)
  }

  self.handleZ = function (hand, range, inverted, callback) {
    self.bounds.y = { max: range*10, min: -range*10, range: range*10*2, mid: -range*10 + (range*10*2)/2 }
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

  /** linear interpolation function
   * @param {Number} alpha - range 0-1, interpolation progress
   */
  function _lerp(start, end, alpha) {
    return start + (end - start) * alpha
  }
  // easing in/out function for linear interpolation using sin curve
  function _easeAlpha(alpha) {
    return -(Math.cos(Math.PI * alpha) - 1) / 2;
  }

  self.setBoundsBehaviour = function (hand, backToMiddle, tolerance, ignore, wait_sec, return_sec) {
    self.bounds.tolerance = Number(tolerance) / 100;
    if (backToMiddle === "true") {
      self.to_middle = true
      self.ignore.move = true
      self.wait_sec = wait_sec
      self.return_sec = return_sec
    } else {
      switch (ignore) {
        case "all":
          self.ignore.move = true
          self.ignore.rotate = true
          self.ignore.grip = true
          break
        case "move":
          self.ignore.move = true
          break
        case "rotate":
          self.ignore.rotate = true
          break
        case "grip":
          self.ignore.grip = true
          break
        case "move_rotate":
          self.ignore.move = true
          self.ignore.rotate = true
          break
        case "move_grip":
          self.ignore.move = true
          self.ignore.grip = true
          break
        case "rotate_grip":
          self.ignore.rotate = true
          self.ignore.grip = true
          break
        default:
          self.ignore.move = false
          self.ignore.rotate = false
          self.ignore.grip = false
          break
      }
    }
  }

  function _radians_to_degrees (radians) {
    var degrees = 180 * radians / Math.PI
    return (degrees + 360) % 360 // avoid negative remainder - % is not mod...
  }

  function _isOutOfBounds(x, y, z, bounds) {
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
  
  self.ignore = { 'move': false, 'rotate': false, 'grip': false }
  self.out_of_bounds = false
  self.bounds = {}
  self.to_middle = false
  self.lerping = false
  self.lerp_timeout = false
  self.wait_sec = false
  self.return_sec = false
  self.return_end_timestamp = false
  self.signal_last_frame = false
  self.no_signal_timeout = false

  self.last_x = { 'Left': false, 'Right': false }
  self.last_y = { 'Left': false, 'Right': false }
  self.last_z = { 'Left': false, 'Right': false }
  self.lerping_from = { 
    last_x: {...self.last_x},
    last_y: {...self.last_y},
    last_z: {...self.last_z},
  }
  self.last_hand = null
  self.last_roll = { 'Left': false, 'Right': false }
  self.last_pitch = { 'Left': false, 'Right': false }
  self.last_yaw = { 'Left': false, 'Right': false }
  self.last_flat = { 'Left': false, 'Right': false }
  self.last_grip = { 'Left': false, 'Right': false }
  let axes = ["x", "y", "z"]

  function _close_enough(number, target) {
    if (Math.floor(number) === Math.floor(target)) return true;
    if (Math.ceil(number) === Math.ceil(target)) return true;
    return false;
  }

  self.handler = function (frame) {
    if (!self.signal_last_frame && !self.no_signal_timeout && !self.out_of_bounds) {
      self.no_signal_timeout = setTimeout(() => {
        self.out_of_bounds = true
      }, 1000)
    } else if (self.signal_last_frame === true) {
      clearTimeout(self.no_signal_timeout);
      self.no_signal_timeout = null
    }

    self.signal_last_frame = false

    // interpolate to middle if required
    if (self.out_of_bounds && self.to_middle) {
      // if not already waiting to interpolate, set a timeout
      if (!self.lerp_timeout) {
        self.lerp_timeout = setTimeout(() => {
          self.lerping = true
          self.lerping_from = { 
            last_x: {...self.last_x},
            last_y: {...self.last_y},
            last_z: {...self.last_z},
            timestamp: Date.now()
          }
          self.return_end_timestamp = 
            self.lerping_from.timestamp + self.return_sec * 1000
        }, self.wait_sec * 1000);
      }
      // if we're currently interpolating
      if (self.lerping) {
        axes.forEach(axis => {
          // if we aren't handling this axis
          if (!self.bounds[axis]) return;
          // stop interpolating if we have reached midpoint
          if (_close_enough(self[`last_${axis}`][self.last_hand], self.bounds[`${axis}`].mid)) return;

          // interpolate axis value
          let duration = self.return_end_timestamp - self.lerping_from.timestamp
          let elapsed = self.return_end_timestamp - Date.now()
          lerped_value = _lerp(
            self.lerping_from[`last_${axis}`][self.last_hand], 
            self.bounds[`${axis}`].mid, 
            _easeAlpha(1 - (elapsed / duration))
          )
          // console.log("lerped", axis, lerped_value)

          // dispatch value
          self[`last_${axis}`][self.last_hand] = lerped_value
          quando.dispatch_event('leapX' + self.last_hand, {'detail': x})
          quando.dispatch_event(`leap${axis.toUpperCase()}Either`, {'detail': lerped_value})
        });
      }
    }

    if (frame.hands) {
      if (frame.hands.length >= 1) {
        for (hand of frame.hands) {
          quando.idle_reset()
          if (hand.confidence == 1) {
            self.signal_last_frame = true
            var [x, y, z] = hand.palmPosition
            var type = hand.type.charAt(0).toUpperCase() + hand.type.slice(1)
            self.last_hand = type
            z = -z // make z increase as the hand moves away from the visitor
            if (_isOutOfBounds(x, y, z, self.bounds)) {
              self.out_of_bounds = true
            } else {
              // console.log("not oob")
              self.out_of_bounds = false
              // clear lerp timeout
              clearTimeout(self.lerp_timeout)
              self.lerp_timeout = false
              self.lerping = false
            }
            if (!(self.out_of_bounds && self.ignore.move)) {
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
