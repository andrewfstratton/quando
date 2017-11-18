(function () {
    var quando = this['quando']
    if (!quando) {
        alert('Fatal Error: Leap Motion must be included after quando_browser')
    }
    var self = this['quando_leap'] = {}
    self.leap = new Leap.Controller();
    self.leap.on('connect', function() {
        self.leap.on('frame', self.handler)
    });
    self.start_check_time = 0
    self.last_x = false
    self.last_y = false
    self.last_z = false

    self.handOpen = function(callback, destruct=true) {
        quando.add_handler("leapHandOpen", callback, destruct)
    }

    self.handClosed = function(callback, destruct=true) {
        quando.add_handler("leapHandClosed", callback, destruct)
    }

    function _handleXYZ (event, callback, extras, destruct=true) {
        var scale = quando.new_scaler(extras.min, extras.max, extras.inverted)
        quando.add_scaled_handler(extras.min, extras.max, event, callback, 
            function(value) {
                return scale(value)
            }, destruct)
    }

    self.handleX = function(callback, extras, destruct=true) {
        _handleXYZ('leapX', callback, extras, destruct)
    }

    self.handleY = function(callback, extras, destruct=true) {
        _handleXYZ('leapY', callback, extras, destruct)
    }

    self.handleZ = function(callback, extras, destruct=true) {
        _handleXYZ('leapZ', callback, extras, destruct)
    }

    self.handler = function(frame) {
        if (frame.hands) {
            if (frame.hands.length >= 1) {
                var hand = frame.hands[0]
                quando.idle_reset()
                var [x, y, z] = hand.palmPosition
                z = -z // make z increase as the hand moves away from the visitor
                if (x != self.last_x) {
                    quando.dispatch_event("leapX", {'detail':x})
                    self.last_x = x
                }
                if (y != self.last_y) {
                    quando.dispatch_event("leapY", {'detail':y})
                    self.last_y = y
                }
                if (z != self.last_z) {
                    quando.dispatch_event("leapZ", {'detail':z})
                    self.last_z = z
                }
                var strength = hand.grabStrength
                if (strength == 1) {
                    quando.dispatch_event("leapHandClosed")
                } else if (strength == 0) {
                    quando.dispatch_event("leapHandOpen")
                }
            }
        }
    }

    self.leap.connect();
 })()