(function () {
    var self = this["quando"] = {};
    self.leap = null;
    self.leap_start_check_time = 0;
    self.idle_reset_secs = 0;
    self.idle_callback_id = 0;
    self.vitrines = new Map();
    self.override_id = 'quando_css_override';
    self.pinching = false;

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

    self.ubitHeading = function(min, max, callback) {
        document.addEventListener("ubitHeading", (ev)=> {
            let heading = ev.detail;
            if ((heading >= min) && (heading <= max)) {
                callback();
            }
//            callback();
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

    self.after = function (time_secs, callback) {
        setTimeout(callback, time_secs * 1000);
    };

    self.every = function (time_secs, callback) {
        callback(); // do it straight away
        return setInterval(callback, time_secs * 1000);
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
    self.image = function (img) {
        if (img) {
            url = 'url(\'' + img + '\')';
            self.setDisplayStyle('#quando_image', 'background-image', url);
        }
    };

    self.do_duration = function (seconds, now, later, inc, dec) {
        if (inc) { inc(); }
        now(inc ? inc : function() { console.log("dummy"); }, dec ? dec : function() {});
        // TODO - this isn't called by the library yet...didn't work?!
        self.after(seconds, function() {
            later(inc ? inc : function() {}, dec ? dec : function() {});
            if (dec) { dec(); }
        } );
    };
    self.video = function (vid, inc, dec) {
        if (inc) { inc(); }
        var video = document.getElementById('quando_video');
        video.pause();
        video.src = vid;
        video.load();
        video.style.visibility = 'visible';
        video.addEventListener('canplay', function() {
            var onend = self.clear_video;
            if (dec) {
                onend = function() {
                    self.clear_video();
                    dec();
                };
            }
            video.addEventListener('ended', onend);
            video.play();
        });
    };
    self.clear_video = function() {
        var video = document.getElementById('quando_video');
        video.pause();
        video.src = '';
        video.style.visibility = 'hidden';
        // Remove all event listeners...
        video.parentNode.replaceChild(video.cloneNode(true), video);
    };
    self.audio = function (audio_in, inc, dec) {
        if (inc) { inc(); }
        var audio = document.getElementById('quando_audio');
        audio.pause();
        audio.src = audio_in;
        audio.load();

        audio.addEventListener('canplay', function() {
            var onend = self.clear_audio;
            if (dec) {
                onend = function() {
                    self.clear_audio();
                    dec();
                };
            }
            audio.addEventListener('ended', onend);
            audio.play();
        });
    };
    self.clear_audio = function() {
        var audio = document.getElementById('quando_audio');
        audio.pause();
        audio.src = '';
    };
    
    
    self.wait = function(do_now, finished) {
        var count = 0;
        do_now(function() { // inc
            count++;
        }, function() { // dec
            count--;
            if (count === 0) {
                finished();
            }
        });
    };
    self.forever = function(now) {
        var count = 1;
        now(function() { // inc
            count++;
        }, function() { // dec
            count--;
            if (count === 0) {
                self.after(0, (function() { self.forever(now); } ));
            }
        });
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
            self.every(1/20, handler);
        } else {
            self.leap = new Leap.Controller();
            self.leap.connect();
            self.leap.on('connect', function() {
                self.every(1/20, handler);
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
            self.every(1/20, handler);
        } else {
            self.leap = new Leap.Controller();
            self.leap.connect();
            self.leap.on('connect', function() {
                self.every(1/20, handler);
            });
        }
    };
    
    self.vitrine = function(key, fn) { // Yes this is all of it...
        self.vitrines.set(key, fn);
    }
    
    self._removeFocus = function() {
        let focused = document.getElementsByClassName('focus');
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
            (self.vitrines.values().next().value)();
            leap.loop(
                {
                    hand: function (hand) {
                        idle_reset();
                        let [x, y] = hand.screenPosition(hand.palmPosition);
                        let cursor = document.getElementById('cursor');
                        let pinch = hand.pinchStrength.toPrecision(2);
                        if (pinch <= 0.6) {
                            self.pinching = false;
                            _style("quando_css", '#cursor', 'opacity', 0.6);
                        } else if (pinch >= 0.9) {
                            _style("quando_css", '#cursor', 'opacity', 1.0);
                        }
                        cursor.style.left = x + 'px';
                        cursor.style.top = y + 'px';
                        cursor.style.visibility = "hidden";
                        let elem = document.elementFromPoint(x, y);
                        cursor.style.visibility = "visible";
                        if (elem) {
                            if (elem.classList.contains("quando_label")) {
                                if (!self.pinching && (pinch >= 0.9)) {
                                        elem.click();
                                        self.pinching = true;
                                }
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
                }).use('screenPosition', {
                    scale: 0.7, verticalOffset: screen.height
                });
        }
    }

    self.showVitrine = function(id) {
        // Find vitrine
        let vitrine = self.vitrines.get(id);
        // Clear current labels, title and text
        document.getElementById('quando_labels').innerHTML = '';
        self.title();
        self.text();
        self.video();
        self._resetStyle();
        vitrine();
    }
    
    self.addLabel = function(id, title) {
        var elem = document.getElementById('quando_labels');
        elem.innerHTML += `<div class='quando_label' onclick="quando.showVitrine('${id}');">${title}</div>`;
    }
    
    let _style = function(style_id, id, property, value) {
        let style = document.getElementById(style_id);
        if (style == null) {
            let styleElem = document.createElement('style');
            styleElem.type = "text/css";
            styleElem.id = style_id;
            document.head.appendChild(styleElem);
            style = styleElem;
        }
        let rule = `${id} \{${property}: ${value};\}\n`;
        style.appendChild(document.createTextNode(rule));
    }

    self.setDisplayStyle = function(id, property, value) {
        _style(self.override_id, id, property, value);
    }

    self.setDefaultStyle = function(id, property, value) {
        _style("quando_css", id, property, value);
    }

    self._resetStyle = function() {
        var elem = document.getElementById(self.override_id);
        if (elem != null) {
            if (elem.parentNode) {
                elem.parentNode.removeChild(elem);
            }
        }
    }
})();