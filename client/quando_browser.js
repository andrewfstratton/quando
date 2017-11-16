(function () {
    var self = this["quando"] = {};
    self.leap = null;
    self.leap_start_check_time = 0;
    self.idle_reset_secs = 0;
    self.idle_callback_id = 0;
    self.vitrines = new Map();
    self.DISPLAY_STYLE = 'quando_css_override';
    self.pinching = false;
    self._vitrine_destructors = [];
    self.DEFAULT_STYLE = "quando_css";

    var _socket = io.connect('http://' + window.location.hostname)

    function endSame(longer, shorter) {
        var loc = longer.indexOf(shorter, longer.length - shorter.length)
        return loc >= 0
    }

    _socket.on('deploy', function(data) {
        var locStr = decodeURIComponent(window.location.href)
        if (locStr.endsWith(data.script)) {
            window.location.reload(true); // nocache reload - probably not necessary
        }
    });

    self.idle_reset = function() {
        if (self.idle_reset_secs > 0) {
            clearTimeout(self.idle_callback_id);
            self.idle_callback_id = setTimeout(self.idle_callback, self.idle_reset_secs);
        } else { // this means we are now idle and must wakeup
            if (self.idle_active_callback) {
                self.idle_active_callback();
            }
        }
    }

    document.onmousemove = self.idle_reset;
    document.onclick = self.idle_reset;
    document.onkeydown = self.idle_reset;
    document.onkeyup = self.idle_reset;

    var last_gesture = "";

    self.dispatch_event = function(event_name, data=false) {
        if (data) {
            document.dispatchEvent(new CustomEvent(event_name, data));            
        } else {
            document.dispatchEvent(new CustomEvent(event_name));
        }
    }

    function _dispatch_gesture(gesture_name) {
        if (gesture_name != last_gesture) {
            last_gesture = gesture_name;
            self.dispatch_event(gesture_name);
        }
    }

    self.add_handler = function(event, callback, destruct) {
        document.addEventListener(event, callback);
        if (destruct) {
            self.addDestructor(function() {
                document.removeEventListener(event, callback);
            });
        }
    }

    self.add_scaled_handler = function(min, max, event_name, callback, scaler = null, destruct=true) {
        var handler = (ev) => {
            var value = ev.detail
            if ((value >= min) && (value <= max)) {
                if (scaler) {
                    value = scaler(value)
                }
                callback(value)
            }
        }
        quando.add_handler(event_name, handler, destruct)
    }
 
    self.new_scaler = function (bottom, top, inverted=false) {
        return (value) => {
            var result = value
            if (result < bottom) { // first clamp to top and bottom value
                result = bottom
            }
            if (result > top) {
                result = top
            }
            // convert to range 0 to 1
            result = (result - bottom) / (top - bottom) // TODO check for negatives and other odd combinations
            if (inverted) {
                result = 1-result
            }
            return result
        }
    }

    self.ubitForward = function(callback, destruct=true) {
        self.add_handler("ubitForward", callback, destruct);
    }

    self.ubitBackward = function(callback, destruct=true) {
        self.add_handler("ubitBackward", callback, destruct);
    }

    self.ubitUp = function(callback, destruct=true) {
        self.add_handler("ubitUp", callback, destruct);
    }

    self.ubitDown = function(callback, destruct=true) {
        self.add_handler("ubitDown", callback, destruct);
    }

    self.ubitLeft = function(callback, destruct=true) {
        self.add_handler("ubitLeft", callback, destruct);
    }

    self.ubitRight = function(callback, destruct=true) {
        self.add_handler("ubitRight", callback, destruct);
    }

    self.ubitA = function(callback, destruct=true) {
        self.add_handler("ubitA", callback, destruct);
    }

    self.ubitB = function(callback, destruct=true) {
        self.add_handler("ubitB", callback, destruct);
    }

    self.angle = function(min, max, event, callback, destruct=true, extras={}) {
        // take min and max modulus 360, i.e in range 0..359
        min = min >= 0 ? min % 360 : (min % 360) + 360; // necessary since % of negatives don't work ?!
        max = max >= 0 ? max % 360 : (max % 360) + 360;
        var handler = function (ev) { // we need the function handler to allow destruction
            var angle = ev.detail;
            angle = 180 * angle / Math.PI;
            angle = (angle +360) % 360; // avoid negative remainder - % is not mod...
            var match = false;
            if (min <= max) {
                if ((angle >= min) && (angle <= max)) {
                    match = true;
                }
            } else { // min > max, e.g min is 345 (or was -15) max is 15
                if ((angle >= min) || (angle <= max)) {
                    match = true;
                }
            }
            if (match) {
                callback(ev.detail, extras); // the angle is passed as radians
            }
        };
        self.add_handler(event, handler, destruct)
    }

    self.ubitHeading = function(min, max, callback, destruct=true) {
        self.angle(min, max, "ubitHeading", callback, destruct);
    }

    self.ubitRoll = function(min, max, callback, destruct=true) {
        self.angle(min, max, "ubitRoll", callback, destruct);
    }

    self.ubitPitch = function(min, max, callback, destruct=true) {
        self.angle(min, max, "ubitPitch", callback, destruct);
    }

    self.handleUbitRoll = function(callback, extras={}, destruct=true) {
        self.angle(0, 359, "ubitRoll", callback, destruct, extras);
    }

    self.handleUbitPitch = function(callback, extras={}, destruct=true) {
        self.angle(0, 359, "ubitPitch", callback, destruct, extras);
    }

    function _clamp_angle(radians, clamp, range, extras, last) {
        if (extras.inverted) {
            radians = -radians;
        }
        var dampen = 0.25;
        if (extras.dampen) {
            dampen = extras.dampen;
        }
        if (radians < -clamp) {
            radians = -clamp;
        }
        if (radians > clamp) {
            radians = clamp;
        }
        let value = (range/2) + (radians/clamp) * range/2;
        let diff = last - value;
        // Dampen
        diff *= dampen;
        value = last - diff
        return value;
    }
    self.last_y = screen.height;
    self.last_x = screen.width;

    function _cursor_adjust() {
        var x = self.last_x;
        var y = self.last_y;
        var cursor = document.getElementById('cursor');
        cursor.style.top = y + 'px';
        cursor.style.left = x + 'px';
        cursor.style.visibility = "hidden"; // TODO this should only be done once - maybe an event (so the second one can be consumed/ignored?)
        var elem = document.elementFromPoint(x, y);
        cursor.style.visibility = "visible";
        self.hover(elem);
        self.idle_reset();
    }
    self.cursor_up_down = function(y) {
        self.last_y = y * screen.height
        _cursor_adjust()
    }

    self.cursor_left_right = function(x) {
        self.last_x = x * screen.width
        _cursor_adjust()
    }
    var Config = self.Config = {
    };

    // var _properties = [];

    // var _newWhen = function (setup) {
    //     var list = [];
    //     setup(list);
    //     return function (lookup, callback) { // return when handler creator
    //         var current = list[lookup] || [];
    //         current.push(callback);
    //         list[lookup] = current;
    //     }; // when handler creator
    // }; // newWhen

    // var _whenCallback = function (key) {
    //     // n.b. this is the list?!
    //     var callbacks = this[key];
    //     if (callbacks) {
    //         var args = Array.prototype.slice.call(arguments).slice(1);
    //         callbacks.forEach(function (update) {
    //             update.apply(this, args); // i.e. any other arguments
    //         });
    //     }
    //     ;
    // };

//    self.whenUpdated = _newWhen(
//            function (list) {
//                Object.observe(
//                        _properties,
//                        function (updates) {
//                            updates.forEach(function (update) {
//                                _whenCallback.call(list, update.name);
//                            });
//                        },
//                        ['update', 'add']); // add allows property creation to trigger callback
//            }
//        );

    // self.setProperty = function (name, val) {
    //     _properties[name] = val;
    // };

    // self.getProperty = function (name) {
    //     return _properties[name];
    // };

    self.after = function (time_secs, callback, destruct=true) {
        var timeout = setTimeout(callback, time_secs * 1000);
        if (destruct) {
            self.addDestructor(function() {
                clearTimeout(timeout);
            });
        }
    };

    self.every = function (time_secs, callback, destruct=true) {
        callback(); // do it straight away
        var id = setInterval(callback, time_secs * 1000);
        if (destruct) {
            self.addDestructor(function() {
                clearInterval(id);
            });
        }
    };

    self.idle = function(time_secs, idle_fn, active_fn) {
        clearTimeout(self.idle_callback_id);
        self.idle_reset_secs = time_secs * 1000;
        self.idle_callback = function() {
            self.idle_reset_secs = 0; // why - surely I need to intercept self.idle_reset 
            // actually - this will work to force self.idle_reset to call idle_active_callback instead
            idle_fn();
        };
        self.idle_active_callback = function() {
            clearTimeout(self.idle_callback_id);
            self.idle_reset_secs = time_secs * 1000; // resets to idle detection
            self.idle_callback_id = setTimeout(self.idle_callback, self.idle_reset_secs);
            // so, restarts timeout when active
            active_fn();
        };
        self.idle_callback_id = setTimeout(self.idle_callback, self.idle_reset_secs);
    }

    self.title = function (txt) {
        var elem = document.getElementById('quando_title');
        if (!txt) {
            elem.style.visibility='hidden';
        } else {
            elem.style.visibility='visible';
            elem.innerHTML = txt;
        }
    };
    self.text = function (txt) {
        var elem = document.getElementById('quando_text');
        if (!txt) {
            elem.style.visibility='hidden';
        } else {
            elem.style.visibility='visible';
            if (typeof txt == 'function') {
                // HACK: N.B. This may be a security worry?!
                txt = txt();
            }
            elem.innerHTML = txt;
        }
    };
    self.image_update_video = function (img) {
        var image = document.getElementById('quando_image');
        if (image.src != encodeURI(window.location.origin + img)) {
            // i.e. only stop the video when the image is different - still need to set the image style...
            // TODO this needs checking for behavioural side effects
            self.clear_video();
        }
    };

    self.video = function (vid, loop=false) {
        var video = document.getElementById('quando_video');
        video.loop = loop;
        if (video.src != encodeURI(window.location.origin + vid)) { // i.e. ignore when already playing
            video.pause();
            video.src = vid;
            video.autoplay = true;
            video.addEventListener('ended', self.clear_video);
            video.style.visibility = 'visible';
            video.load();
        }
    };

    self.clear_video = function() {
        var video = document.getElementById('quando_video');
        video.pause();
        video.src = '';
        video.style.visibility = 'hidden';
        // Remove all event listeners...
        video.parentNode.replaceChild(video.cloneNode(true), video);
    };

    self.audio = function (audio_in, loop=false) {
        var audio = document.getElementById('quando_audio');
        audio.loop = loop;
        if ( audio.src != encodeURI(window.location.origin + audio_in)) { // src include http://127.0.0.1/
            audio.pause();
            audio.src = audio_in;
            audio.autoplay = true;
            audio.addEventListener('ended', self.clear_audio);
            audio.load();
            audio.play();
        }
    };
    self.clear_audio = function() {
        var audio = document.getElementById('quando_audio');
        audio.pause();
        audio.src = '';
    };
    
    self.hands = function(count, do_fn) {
        var hands = "None";
        var handler = function () {
            frame = self.leap.frame();
            if (frame.hands) {
                self.idle_reset(); // any hand data means there is a visitor present...
                if (frame.hands.length !== hands) {
                    //                var now = (new Date).getTime();
                    //                if (now > self.leap_start_check_time+1000) {
                    //                    self.leap_start_check_time = now;
                    hands = frame.hands.length;
                    if (hands === count) {
                        do_fn();
                    }
                    //                }
                }
            }
        };
        if (self.leap) {
            self.every(1/20, handler, false);
        } else {
            self.leap = new Leap.Controller();
            self.leap.connect();
            self.leap.on('connect', function() {
                self.every(1/20, handler, false);
            });
        }
    };

    self.handed = function(left, right, do_fn) {
        var handler = function() {
// FIX very inefficient...
            frame = self.leap.frame();
            var now_left = false;
            var now_right = false;
            if (frame.hands) {
                self.idle_reset(); // any hand data means there is a visitor present...
                if (frame.hands.length !== 0) {
                    var hands = frame.hands;
                    for (var i = 0; i < hands.length; i++) {
                        var handed = hands[i].type;
                        if (handed === "left") {
                            now_left = true;
                        }
                        if (handed === "right") {
                            now_right = true;
                        }
                    }
                }
            }
            if ((now_right === right) && (now_left === left)) {
                do_fn();
            }
        };
        if (self.leap) {
            self.every(1/20, handler, false);
        } else {
            self.leap = new Leap.Controller();
            self.leap.connect();
            self.leap.on('connect', function() {
                self.every(1/20, handler, false);
            });
        }
    };
    
    self.vitrine = function(key, fn) { // Yes this is all of it...
        self.vitrines.set(key, fn);
    }
    
    self._removeFocus = function() {
        var focused = document.getElementsByClassName('focus');
        for (var focus of focused) {
            focus.classList.remove('focus');
            focus.removeEventListener("transitionend", self._handle_transition);
        }
    }
    self._handle_transition = function(ev) {
        ev.target.click();
    }
    
    self.startVitrine = function(leap) {
        document.querySelector('#quando_title').addEventListener('contextmenu', // right click title to go to setup
            function (ev) {
                ev.preventDefault();
                window.location.href = "../../client/setup";
                return false;
            }, false);
        self.pinching = false;
        self.setDefaultStyle('#cursor', 'opacity', 0.6);
        if (self.vitrines.size != 0) {
            // TODO Should this be deferred?
            (self.vitrines.values().next().value)(); // this runs the very first vitrine :)
            // can't use [0] because we don't know the id of the first entry
        }
    }

    self.hover = function(elem) {
        if (elem) {
            if (!elem.classList.contains("focus")) { // the element is not in 'focus'
                // remove focus from all other elements - since the cursor isn't over them
                self._removeFocus();
                if (elem.classList.contains("quando_label")) {
                    elem.classList.add("focus");
                    elem.addEventListener("transitionend", self._handle_transition);
                }
            }
        } else {
            // remove focus from any elements - since the cursor isn't over any
            self._removeFocus();
        }
    }

    // self.leap_pinch = function(hand, elem) {
    //     var pinch = hand.pinchStrength.toPrecision(2);
    //     if (pinch <= 0.6) {
    //         self.pinching = false;
    //         self.setDefaultStyle('#cursor', 'opacity', 0.6);
    //     } else if (pinch >= 0.9) {
    //         self.setDefaultStyle('#cursor', 'opacity', 1.0);
    //     }
    //     if (elem) {
    //         if (elem.classList.contains("quando_label")) {
    //             if (!self.pinching && (pinch >= 0.9)) {
    //                     elem.click();
    //                     self.pinching = true;
    //             }
    //         } else if (pinch >= 0.9) {
    //             self.pinching = true;
    //         }
    //         if (!elem.classList.contains("focus")) { // the element is not in 'focus'
    //             // remove focus from all other elements - since the cursor isn't over them
    //             self._removeFocus();
    //             if (elem.classList.contains("quando_label")) {
    //                 elem.classList.add("focus");
    //             }
    //         }
    //     } else {
    //         // remove focus from any elements - since the cursor isn't over them
    //         self._removeFocus();
    //     }
    // }

    self.showVitrine = function(id) {
        // perform any destructors - which will cancel pending events, etc.
        var destructor = self._vitrine_destructors.pop();
        while (destructor) {
            destructor();
            destructor = self._vitrine_destructors.pop();
        }
        // Find vitrine
        var vitrine = self.vitrines.get(id);
        // Clear current labels, title and text
        document.getElementById('quando_labels').innerHTML = '';
        self.title();
        self.text();
//        self.video(); removed to make sure video can continue playing between displays
        self._resetStyle();
        vitrine();
    }
    
    self.addLabel = function(id, title) {
        var elem = document.getElementById('quando_labels');
        var div = document.createElement('div');
        div.className = 'quando_label';
        div.innerHTML = title;
        elem.appendChild(div);
        div.onclick = function() { setTimeout(function() {quando.showVitrine(id)}, 0) };
    }
    
    self.addLabelStatement = function(text, fn) {
        var elem = document.getElementById('quando_labels');
        var div = document.createElement('div');
        div.className = 'quando_label';
        div.innerHTML = text;
        elem.appendChild(div);
        div.onclick = fn;
    }

    var _style = function(style_id, id, property, value, separator=null) {
        var style = document.getElementById(style_id);
        if (style == null) {
            var styleElem = document.createElement('style');
            styleElem.type = "text/css";
            styleElem.id = style_id;
            document.head.appendChild(styleElem);
            style = styleElem;
        }
        if (separator) {
            for(var child of style.childNodes) {
                var data = child.data;
                if (data.startsWith(id + ' ')) {
                    data = data.replace(id + ' ', '');
                    if (data.startsWith('{' + property + ': ')) {
                        data = data.replace('{' + property + ': ', '');
                        var endOf = data.lastIndexOf(';}');
                        if (endOf != -1) {
                            data = data.substring(0, endOf);
                            value = data + separator + value; // Note - this appends the new property
            // console.log(value);
                        }
                    }
                }
            }
        }
        var rule = `${id} \{${property}: ${value};\}\n`;
        style.appendChild(document.createTextNode(rule));
    }

    self.setDisplayStyle = function(id, property, value, separator=null) {
        _style(self.DISPLAY_STYLE, id, property, value, separator);
    }

    self.setDefaultStyle = function(id, property, value, separator=null) {
        _style(self.DEFAULT_STYLE, id, property, value, separator);
    }

    self._resetStyle = function() {
        var elem = document.getElementById(self.DISPLAY_STYLE);
        if (elem != null) {
            if (elem.parentNode) {
                elem.parentNode.removeChild(elem);
            }
        }
    }

    self.addDestructor = function(fn) {
        self._vitrine_destructors.push(fn);
    }

    _socket.on('ubit', function(data) {
        if (data.ir) {
            self.idle_reset();
        } else if (data.orientation) {
            self.idle_reset(); // this is only received when the orientation changes
            if (data.orientation == "forward") {
                _dispatch_gesture("ubitForward");
            } else if (data.orientation == "backward") {
                _dispatch_gesture("ubitBackward");
            } else if (data.orientation == "up") {
                _dispatch_gesture("ubitUp");
            } else if (data.orientation == "down") {
                _dispatch_gesture("ubitDown");
            } else if (data.orientation == "left") {
                _dispatch_gesture("ubitLeft");
            } else if (data.orientation == "right") {
                _dispatch_gesture("ubitRight");
            } else if (data.orientation == "") { // this is the micro bit started
                last_gesture = "";
            }
        } else if (data.button) {
            self.idle_reset();
            if (data.button == "a") {
                self.dispatch_event("ubitA");
            }
            if (data.button == "b") {
                self.dispatch_event("ubitB");
            }
        } else if (data.heading) {
            self.dispatch_event("ubitHeading", {'detail':data.heading});
            self.idle_reset();
        } else if (data.roll || data.pitch) {
            if (data.roll) {
                self.dispatch_event("ubitRoll", {'detail':data.roll});
            }
            if (data.pitch) {
                self.dispatch_event("ubitPitch", {'detail':data.pitch});
            }
            self.idle_reset();
        }
    });
})();