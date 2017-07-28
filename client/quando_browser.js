(function () {
    var self = this["quando"] = {};
    self.leap = null;
    self.leap_start_check_time = 0;
    self.idle_reset_secs = 0;
    self.idle_callback_id = 0;
    self.vitrines = new Map();
    self.override_id = 'quando_css_override';
    self.pinching = false;
    self._vitrine_destructors = [];

    var _socket = io.connect('http://' + location.hostname)

    function endSame(longer, shorter) {
        var loc = longer.indexOf(shorter, longer.length - shorter.length)
        return loc >= 0
    }

    _socket.on('deploy', function(data) {
        var locStr = location + "" // have to force change to string...
        if (locStr.endsWith(data.script)) {
            location.reload(true); // nocache reload - probably not necessary
        }
    });

    function idle_reset() {
        if (self.idle_reset_secs > 0) {
            clearTimeout(self.idle_callback_id);
            self.idle_callback_id = setTimeout(self.idle_callback, self.idle_reset_secs);
        } else { // this means we are now idle and must wakeup
            if (self.idle_active_callback) {
                self.idle_active_callback();
            }
        }
    }

    document.onmousemove = idle_reset;
    document.onclick = idle_reset;
    document.onkeydown = idle_reset;
    document.onkeyup = idle_reset;

    _socket.on('ubit', function(data) {
        if (data.button == 'a') {
            console.log("button a pressed")
        } else if (data.button == 'b') {
            console.log("button b pressed")
        } else if (data.ir) {
            idle_reset();
        } else if (data.orientation) {
            if (data.orientation == "up") {
                document.dispatchEvent(new CustomEvent("ubitUp"));
            } else if (data.orientation == "down") {
                document.dispatchEvent(new CustomEvent("ubitDown"));
            } else if (data.orientation == "face up") {
                document.dispatchEvent(new CustomEvent("ubitFaceUp"));
            } else if (data.orientation == "face down") {
                document.dispatchEvent(new CustomEvent("ubitFaceDown"));
            } else if (data.orientation == "left") {
                document.dispatchEvent(new CustomEvent("ubitLeft"));
            } else if (data.orientation == "right") {
                document.dispatchEvent(new CustomEvent("ubitRight"));
            }
        } else if (data.heading) {
            document.dispatchEvent(new CustomEvent("ubitHeading", {'detail':data.heading}));
        }
    });

    self.ubitUp = function(callback) {
        document.addEventListener("ubitUp", callback);
    }

    self.ubitDown = function(callback) {
        document.addEventListener("ubitDown", callback);
    }

    self.ubitFaceUp = function(callback) {
        document.addEventListener("ubitFaceUp", callback);
    }

    self.ubitFaceDown = function(callback) {
        document.addEventListener("ubitFaceDown", callback);
    }

    self.ubitLeft = function(callback) {
        document.addEventListener("ubitLeft", callback);
    }

    self.ubitRight = function(callback) {
        document.addEventListener("ubitRight", callback);
    }

    self.ubitHeading = function(min, max, callback) {
        document.addEventListener("ubitHeading", function (ev) {
            var heading = ev.detail;
            if ((heading >= min) && (heading <= max)) {
                callback();
            }
        });
    }

    var Config = self.Config = {
    };

    var _properties = [];

    var _newWhen = function (setup) {
        var list = [];
        setup(list);
        return function (lookup, callback) { // return when handler creator
            var current = list[lookup] || [];
            current.push(callback);
            list[lookup] = current;
        }; // when handler creator
    }; // newWhen

    var _whenCallback = function (key) {
        // n.b. this is the list?!
        var callbacks = this[key];
        if (callbacks) {
            var args = Array.prototype.slice.call(arguments).slice(1);
            callbacks.forEach(function (update) {
                update.apply(this, args); // i.e. any other arguments
            });
        }
        ;
    };

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

    self.setProperty = function (name, val) {
        _properties[name] = val;
    };

    self.getProperty = function (name) {
        return _properties[name];
    };

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
            self.idle_reset_secs = 0; // why - surely I need to intercept idle_reset 
            // actually - this will work to force idle_reset to call idle_active_callback instead
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
            video.load();
            video.style.visibility = 'visible';
            video.addEventListener('canplay', function() {
                video.addEventListener('ended', self.clear_video);
                video.play();
            });
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
            audio.load();
            audio.addEventListener('canplay', function() {
                audio.addEventListener('ended', self.clear_audio);
                audio.play();
            });
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
                idle_reset(); // any hand data means there is a visitor present...
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
                idle_reset(); // any hand data means there is a visitor present...
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
            (ev) => {
                ev.preventDefault();
                location.href = "../../client/setup";
                return false;
            }, false);
        self.pinching = false;
        _style("quando_css", '#cursor', 'opacity', 0.6);
        if (self.vitrines.size != 0) {
            // TODO Should this be deferred?
            (self.vitrines.values().next().value)(); // this runs the very first vitrine :)
            // can't use [0] because we don't know the id of the first entry
            leap.loop(
                {
                    hand: function(hand) {
                        idle_reset();
                        var [x, y] = hand.screenPosition(hand.palmPosition);
                        var cursor = document.getElementById('cursor');
                        cursor.style.left = x + 'px';
                        cursor.style.top = y + 'px';
                        cursor.style.visibility = "hidden";
                        var elem = document.elementFromPoint(x, y);
                        cursor.style.visibility = "visible";
                        self.leap_hover(hand, elem);
                    }
                }).use('screenPosition', {
                    scale: 0.7, verticalOffset: screen.height
                });
        }
    }

    self.leap_hover = function(hand, elem) {
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

    self.leap_pinch = function(hand, elem) {
        var pinch = hand.pinchStrength.toPrecision(2);
        if (pinch <= 0.6) {
            self.pinching = false;
            _style("quando_css", '#cursor', 'opacity', 0.6);
        } else if (pinch >= 0.9) {
            _style("quando_css", '#cursor', 'opacity', 1.0);
        }
        if (elem) {
            if (elem.classList.contains("quando_label")) {
                if (!self.pinching && (pinch >= 0.9)) {
                        elem.click();
                        self.pinching = true;
                }
            } else if (pinch >= 0.9) {
                self.pinching = true;
            }
            if (!elem.classList.contains("focus")) { // the element is not in 'focus'
                // remove focus from all other elements - since the cursor isn't over them
                self._removeFocus();
                if (elem.classList.contains("quando_label")) {
                    elem.classList.add("focus");
                }
            }
        } else {
            // remove focus from any elements - since the cursor isn't over them
            self._removeFocus();
        }
    }

    self.showVitrine = function(id) {
        // performa ny desctructors - which will cancel pending events, etc.
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
            console.log(value);
                        }
                    }
                }
            }
        }
        var rule = `${id} \{${property}: ${value};\}\n`;
        style.appendChild(document.createTextNode(rule));
    }

    self.setDisplayStyle = function(id, property, value, separator=null) {
        _style(self.override_id, id, property, value, separator);
    }

    self.setDefaultStyle = function(id, property, value, separator=null) {
        _style("quando_css", id, property, value, separator);
    }

    self._resetStyle = function() {
        var elem = document.getElementById(self.override_id);
        if (elem != null) {
            if (elem.parentNode) {
                elem.parentNode.removeChild(elem);
            }
        }
    }

    self.addDestructor = function(fn) {
        self._vitrine_destructors.push(fn);
    }

    // constructor
//    _style('quando_css', '#quando_title', 'top', '0px');

})();