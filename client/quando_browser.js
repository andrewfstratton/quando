(function () {
  var self = this['quando'] = {}
  self.idle_reset_secs = 0
  self.idle_callback_id = 0
  self.vitrines = new Map()
  self.DISPLAY_STYLE = 'quando_css_override'
  self.pinching = false
  self._vitrine_destructors = []
  self.DEFAULT_STYLE = 'quando_css'
  var _lookup = {} // holds run time arrays

  self.socket = io.connect('http://' + window.location.hostname)

  function _displayWidth() {
    return window.innerWidth
  }

  function _displayHeight() {
    return window.innerHeight
  }

  function endSame (longer, shorter) {
    var loc = longer.indexOf(shorter, longer.length - shorter.length)
    return loc >= 0
  }

  self.socket.on('deploy', function (data) {
    var locStr = decodeURIComponent(window.location.href)
    if (locStr.endsWith('/'+data.script)) {
      window.location.reload(true) // nocache reload - probably not necessary
    }
  })

  self.idle_reset = function () {
    if (self.idle_reset_secs > 0) {
      clearTimeout(self.idle_callback_id)
      self.idle_callback_id = setTimeout(self.idle_callback, self.idle_reset_secs)
    } else { // this means we are now idle and must wakeup
      if (self.idle_active_callback) {
        self.idle_active_callback()
      }
    }
  }

  document.onmousemove = self.idle_reset
  document.onclick = self.idle_reset
  document.onkeydown = self.idle_reset
  document.onkeyup = self.idle_reset

  self.dispatch_event = function (event_name, data = false) {
    if (data) {
      document.dispatchEvent(new CustomEvent(event_name, data))
    } else {
      document.dispatchEvent(new CustomEvent(event_name))
    }
  }

  self.add_handler = function (event, callback, destruct) {
    document.addEventListener(event, callback)
    if (destruct) {
      self.addDestructor(function () {
        document.removeEventListener(event, callback)
      })
    }
  }

  self.add_scaled_handler = function (event_name, callback, scaler, destruct = true) {
    var handler = function (ev) {
      var value = scaler(ev.detail)
      if (value !== null) {
        callback(value)
      }
    }
    quando.add_handler(event_name, handler, destruct)
  }

  self.new_scaler = function (min, max, inverted = false) {
    return function (value) {
      // convert to range 0 to 1 for min to max
      var result = (value - min) / (max - min)
      result = Math.min(1, result)
      result = Math.max(0, result)
      if (inverted) {
        result = 1 - result
      }
      return result
    }
  }

  self.new_angle_scaler = function (mid, plus_minus, inverted = false) {
    var mod = function(x, n) {
        return ((x%n)+n)%n
    }
    var last_result = 0
    var crossover = mod(mid+180, 360)
    // i.e. 25% of the non used range
    var crossover_range = (180 - Math.abs(plus_minus)) / 4
    return function (value) {
      var x = mod(value - mid, 360)
      if (x > 180) { x -= 360}
      var result = (x + plus_minus) / (2 * plus_minus)
      if (inverted) {
        result = 1 - result
      }
      if ((result < 0) || (result > 1)) { // i.e. result is out of range
            // identify if result should be used
            var diff = Math.abs(crossover - mod(value, 360))
            if (diff <= crossover_range) { // inside crossover range, so use the last result 
                result = last_result
            }
      }
      result = Math.min(1, result)
      result = Math.max(0, result)
      last_result = result
      return result
    }
  }

  // Start in the middle
  self._y = _displayHeight()
  self._x = _displayWidth()

  function _cursor_adjust () {
    var x = self._x
    var y = self._y
    var style = document.getElementById('cursor').style
    var max_width = _displayWidth()
    var max_height = _displayHeight()
    if (x < 0) {
      x = 0
    } else if (x > max_width) {
      x = max_width
    }
    if (y < 0) {
      y = 0
    } else if (y > max_height) {
      y = max_height
    }
    style.top = y + 'px'
    style.left = x + 'px'
    style.visibility = 'hidden' // TODO this should only be done once - maybe an event (so the second one can be consumed/ignored?)
    var elem = document.elementFromPoint(x, y)
    style.visibility = 'visible'
    self.hover(elem)
    self.idle_reset()
  }

  self.cursor_up_down = function (y, extras) {
    if (y === false) {
      y = (extras.min + extras.max)/2
    }
    y = 1 - y // invert
    var scr_min = extras.min * _displayHeight()
    var scr_max = extras.max * _displayHeight()
    self._y = scr_min + (y * (scr_max-scr_min))
    _cursor_adjust()
  }

  self.cursor_left_right = function (x, extras) {
    if (x === false) {
      x = (extras.min + extras.max)/2
    }
    var scr_min = extras.min * _displayWidth()
    var scr_max = extras.max * _displayWidth()
    self._x = scr_min + (x * (scr_max-scr_min))
    _cursor_adjust()
  }

  var Config = self.Config = {
  }

  self.after = function (time_secs, callback, destruct = true) {
    var timeout = setTimeout(callback, time_secs * 1000)
    if (destruct) {
      self.addDestructor(function () {
        clearTimeout(timeout)
      })
    }
  }

  self.every = function (time_secs, callback, destruct = true) {
    callback() // do it straight away
    var id = setInterval(callback, time_secs * 1000)
    if (destruct) {
      self.addDestructor(function () {
        clearInterval(id)
      })
    }
  }

  self.idle = function (time_secs, idle_fn, active_fn) {
    clearTimeout(self.idle_callback_id)
    self.idle_reset_secs = time_secs * 1000
    self.idle_callback = function () {
      self.idle_reset_secs = 0 // why - surely I need to intercept self.idle_reset
            // actually - this will work to force self.idle_reset to call idle_active_callback instead
      idle_fn()
    }

  self.idle_active_callback = function () {
      clearTimeout(self.idle_callback_id)
      self.idle_reset_secs = time_secs * 1000 // resets to idle detection
      self.idle_callback_id = setTimeout(self.idle_callback, self.idle_reset_secs)
            // so, restarts timeout when active
      active_fn()
    }
    self.idle_callback_id = setTimeout(self.idle_callback, self.idle_reset_secs)
  }

  function _set_or_append_tag_text(txt, tag, append) {
    var elem = document.getElementById(tag)
    if (typeof txt === 'function') {
      // HACK: N.B. This may be a security worry?!
      txt = txt()
    }    
    if (append) {
      txt = elem.innerHTML + txt
    }
    if (!txt) {
      elem.style.visibility = 'hidden'
      txt = ''
    } else {
      elem.style.visibility = 'visible'
    }
    elem.innerHTML = txt
  }
  
  self.title = function (txt, append=false) {
    _set_or_append_tag_text(txt, 'quando_title', append)
  }

  self.text = function (txt, append=false) {
    _set_or_append_tag_text(txt, 'quando_text', append)
  }

  self.image_update_video = function (img) {
    var image = document.getElementById('quando_image')
    if (image.src != encodeURI(window.location.origin + img)) {
            // i.e. only stop the video when the image is different - still need to set the image style...
            // TODO this needs checking for behavioural side effects
      self.clear_video()
    }
  }

  self.video = function (vid, loop = false) {
    var video = document.getElementById('quando_video')
    video.loop = loop
    if (video.src != encodeURI(window.location.origin + vid)) { // i.e. ignore when already playing
      if (video.src) {
        video.pause()
      }
      video.src = vid
      video.autoplay = true
      video.addEventListener('ended', self.clear_video)
      video.style.visibility = 'visible'
      video.load()
    }
  }

  self.clear_video = function () {
    var video = document.getElementById('quando_video')
    video.src = ''
    video.style.visibility = 'hidden'
    // Remove all event listeners...
    video.parentNode.replaceChild(video.cloneNode(true), video)
  }

  self.audio = function (audio_in, loop = false) {
    var audio = document.getElementById('quando_audio')
    audio.loop = loop
    if (audio.src != encodeURI(window.location.origin + audio_in)) { // src include http://127.0.0.1/
      if (audio.src) {
        audio.pause()
      }
      audio.src = audio_in
      audio.autoplay = true
      audio.addEventListener('ended', self.clear_audio)
      audio.load()
      // audio.play()
    }
  }
  self.clear_audio = function () {
    var audio = document.getElementById('quando_audio')
    audio.src = ''
    // Remove all event listeners...
    audio.parentNode.replaceChild(audio.cloneNode(true), audio)
  }

  self.hands = function (count, do_fn) {
    var hands = 'None'
    var handler = function () {
      frame = self.leap.frame()
      if (frame.hands) {
        self.idle_reset() // any hand data means there is a visitor present...
        if (frame.hands.length !== hands) {
                    //                var now = (new Date).getTime()
                    //                if (now > self.leap_start_check_time+1000) {
                    //                    self.leap_start_check_time = now
          hands = frame.hands.length
          if (hands === count) {
            do_fn()
          }
                    //                }
        }
      }
    }
    if (self.leap) {
      self.every(1 / 20, handler, false)
    } else {
      self.leap = new Leap.Controller()
      self.leap.connect()
      self.leap.on('connect', function () {
        self.every(1 / 20, handler, false)
      })
    }
  }

  self.handed = function (left, right, do_fn) {
    var handler = function () {
// FIX very inefficient...
      frame = self.leap.frame()
      var now_left = false
      var now_right = false
      if (frame.hands) {
        self.idle_reset() // any hand data means there is a visitor present...
        if (frame.hands.length !== 0) {
          var hands = frame.hands
          for (var i = 0; i < hands.length; i++) {
            var handed = hands[i].type
            if (handed === 'left') {
              now_left = true
            }
            if (handed === 'right') {
              now_right = true
            }
          }
        }
      }
      if ((now_right === right) && (now_left === left)) {
        do_fn()
      }
    }
    if (self.leap) {
      self.every(1 / 20, handler, false)
    } else {
      self.leap = new Leap.Controller()
      self.leap.connect()
      self.leap.on('connect', function () {
        self.every(1 / 20, handler, false)
      })
    }
  }

  self.vitrine = function (key, fn) { // Yes this is all of it...
    self.vitrines.set(key, fn)
  }

  self._removeFocus = function () {
    var focused = document.getElementsByClassName('focus')
    for (var focus of focused) {
      focus.classList.remove('focus')
      focus.removeEventListener('transitionend', self._handle_transition)
    }
  }
  self._handle_transition = function (ev) {
    ev.target.click()
  }

  self.startVitrine = function (leap) {
    self.setDefaultStyle('#cursor', 'background-color', 'rgba(255, 255, 102, 0.7)');
    self.setDefaultStyle('#cursor', ['width','height'], '4.4vw');
    self.setDefaultStyle('#cursor', ['margin-left','margin-top'], '-2.2vw');    
    document.querySelector('#quando_title').addEventListener('contextmenu', // right click title to go to setup
            function (ev) {
              ev.preventDefault()
              window.location.href = '../../client/setup'
              return false
            }, false)
    self.pinching = false
    if (self.vitrines.size != 0) {
            // TODO Should this be deferred?
      (self.vitrines.values().next().value)() // this runs the very first vitrine :)
            // can't use [0] because we don't know the id of the first entry
    }
  }

  self.hover = function (elem) {
    if (elem) {
      if (!elem.classList.contains('focus')) { // the element is not in 'focus'
                // remove focus from all other elements - since the cursor isn't over them
        self._removeFocus()
        if (elem.classList.contains('quando_label')) {
          elem.classList.add('focus')
          elem.addEventListener('transitionend', self._handle_transition)
        }
      }
    } else {
            // remove focus from any elements - since the cursor isn't over any
      self._removeFocus()
    }
  }

  self.showVitrine = function (id) {
        // perform any destructors - which will cancel pending events, etc.
    var destructor = self._vitrine_destructors.pop()
    while (destructor) {
      destructor()
      destructor = self._vitrine_destructors.pop()
    }
        // Find vitrine
    var vitrine = self.vitrines.get(id)
        // Clear current labels, title and text
    document.getElementById('quando_labels').innerHTML = ''
    self.title()
    self.text()
//        self.video() removed to make sure video can continue playing between displays
    self._resetStyle()
    vitrine()
  }

  self.addLabel = function (id, title) {
    var elem = document.getElementById('quando_labels')
    var div = document.createElement('div')
    div.className = 'quando_label'
    div.innerHTML = title
    elem.appendChild(div)
    div.onclick = function () { setTimeout(function () { quando.showVitrine(id) }, 0) }
  }

  self.addLabelStatement = function (text, fn) {
    var elem = document.getElementById('quando_labels')
    var div = document.createElement('div')
    div.className = 'quando_label'
    div.innerHTML = text
    elem.appendChild(div)
    div.onclick = fn
  }

  var _style = function (style_id, id, property, value, separator = null) {
    var style = document.getElementById(style_id)
    if (style == null) {
      var styleElem = document.createElement('style')
      styleElem.type = 'text/css'
      styleElem.id = style_id
      document.head.appendChild(styleElem)
      style = styleElem
    }
    if (separator) {
      for (var child of style.childNodes) {
        var data = child.data
        if (data.startsWith(id + ' ')) {
          data = data.replace(id + ' ', '')
          if (data.startsWith('{' + property + ': ')) {
            data = data.replace('{' + property + ': ', '')
            var endOf = data.lastIndexOf(';}')
            if (endOf != -1) {
              data = data.substring(0, endOf)
              value = data + separator + value // Note - this appends the new property
            }
          }
        }
      }
    }
    var rule
    if (property instanceof Array) {
      for (i in property) {
        rule = id + '{' + property[i] + ': ' + value + ';}\n'
        style.appendChild(document.createTextNode(rule))
      }
    } else {
      rule = id + '{' + property + ': ' + value + ';}\n'
      style.appendChild(document.createTextNode(rule))
    }
  }

  self.setDisplayStyle = function (id, property, value, separator = null) {
    _style(self.DISPLAY_STYLE, id, property, value, separator)
  }

  self.setDefaultStyle = function (id, property, value, separator = null) {
    _style(self.DEFAULT_STYLE, id, property, value, separator)
  }

  self._resetStyle = function () {
    var elem = document.getElementById(self.DISPLAY_STYLE)
    if (elem != null) {
      if (elem.parentNode) {
        elem.parentNode.removeChild(elem)
      }
    }
  }

  self.addDestructor = function (fn) {
    self._vitrine_destructors.push(fn)
  }

  self.pick = function(val, arr) {
    if (val === false) {
      val = 0.5
    }
    var i = Math.floor(val * arr.length)
    if (i == arr.length) {
      i--
    }
    arr[i]()
  }

  self.pick_random = function(arr) {
    var r = Math.random()
    self.pick(r, arr)
  }

  self.pick_one_each_time = function(arr) {
    if (arr.length > 0) {
      if (!arr.hasOwnProperty('index')) {
        arr.index = 0
      }
      var fn = arr[arr.index]
      if (++arr.index >= arr.length) {
        arr.index = 0
      }
      if (typeof fn === 'function') { fn() }
    }
  }

  self.setOnId = (id, val) => {
    _lookup[id] = val
  }

  self.getOnId = (id) => {
    return _lookup[id]
  }

})()

var val = false // force handler to manage when not embedded