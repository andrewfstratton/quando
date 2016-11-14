(function () {
    var self = this["quando"] = {};
    self.colour = 'black';
    self.leap = null;
    self.leap_start_check_time = 0;
    self.vitrines = new Map();

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
    self.setBackgroundColour = function(colour) {
        self.colour = colour;
    };
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
        var style = document.getElementById('quando_image').style;
        var url = 'transparent.png';
        if (img) {
            url = 'url(\'' + img + '\')';
        }
        style['background'] = url;
        style['background-repeat'] = 'no-repeat';
        style['background-size'] = 'contain';
        style['background-position'] = 'center center';
        style['background-color'] = self.colour;
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
        var handler = function() {
            frame = self.leap.frame();
            if (frame.hands && (frame.hands.length !== hands)) {
//                var now = (new Date).getTime();
//                if (now > self.leap_start_check_time+1000) {
//                    self.leap_start_check_time = now;
                    hands = frame.hands.length;
                    if (hands === count) {
                        do_fn();
                    }
//                }
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
            if (frame.hands && (frame.hands.length !== 0)) {
                var hands = frame.hands;
                for (var i=0; i<hands.length; i++) {
                    var handed = hands[i].type;
console.log(handed);
                    if (handed === "left") {
                        now_left = true;
                    }
                    if (handed === "right") {
                        now_right = true;
                    }
                }
            }
//console.log("now right=" + now_right + ", left=" + now_left);
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
//        alert("click it" + ev);
        ev.target.click();
    }
    
    self.startVitrine = function(leap) {
        document.querySelector('#quando_title').addEventListener('contextmenu',
            (ev) => {
                ev.preventDefault();
                location.href = "../client/setup.html";
                return false;
            }, false);
        if (self.vitrines.size != 0) {
            // TODO Should this be deferred?
            (self.vitrines.values().next().value)();
            leap.loop(
                { hand: function (hand) {
                    let [x, y] = hand.screenPosition(hand.palmPosition);
                    let cursor = document.getElementById('cursor');
                    cursor.style.left = x + 'px';
                    cursor.style.top = y + 'px';
                    cursor.style.visibility = "hidden";
                    let elem = document.elementFromPoint(x, y);
                    cursor.style.visibility = "visible";
                    if (elem) {
                        if (!elem.classList.contains("focus")) {
                            // remove focus from all other elements - since the cursor isn't over them
                            self._removeFocus();
                            if (elem.classList.contains("quando_label")) {
                                elem.classList.add("focus");
                                elem.addEventListener("transitionend", self._handle_transition);
                            }
                        }
                    } else {
                        // remove focus from any elements - since the cursor isn't over them
                        self._removeFocus();
                    }
                }}).use('screenPosition', {
                    scale: 1, verticalOffset: screen.height
                });
        }
    }

    self.showVitrine = function(id) {
        // TODO find vitrine
        let vitrine = self.vitrines.get(id);
        // Clear current labels
        var elem = document.getElementById('quando_labels');
        elem.innerHTML = '';
        for(var id of ['title','text']) {
            let div = document.getElementById('quando_' + id);
            div.style.fontSize = "";
            div.style.color = "";
            div.style.backgroundColor = "";
//            for (var prop of ['color', 'backgroundColor', 'fontSize', 'opacity']) {
//                div.style.removeProperty(prop);
//            }        
        }
        vitrine();
    }
    
    self.addLabel = function(id, title) {
        var elem = document.getElementById('quando_labels');
        elem.innerHTML += `<div class='quando_label' onclick="quando.showVitrine('${id}');">${title}</div>`;
    }    
})();