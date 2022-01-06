import * as destructor from "./modules/destructor.js";
import * as text from "/common/text.js";

// Note: This is not a true module - but pretends to be one to include a module itself
// next line sets quando as a global object to contain all the other client 'modules'
let self = window.quando = {}

let idle_reset_ms = 0
let idle_callback_id = 0
let _displays = new Map()
let _current_display_id = -1 // to avoid being equal by accident to 0
let io_protocol = "ws"
let port = window.location.port

if (['wss:','https:'].includes(window.location.protocol)) {
  io_protocol += "s"
  if (port == 443) {
    port = ''
  }
} else if (port == 80) {
  port = ''
}
if (port != '') {
  port = ":" + port
}
let socket = io.connect(io_protocol + '://' + window.location.hostname + port)

  function _displayWidth() {
    return window.innerWidth
  }

  function _displayHeight() {
    return window.innerHeight
  }

  socket.on('deploy', function (data) {
    let locStr = decodeURIComponent(window.location.href)
    if (locStr.endsWith('/'+data.script)) {
      window.location.reload(true) // nocache reload - probably not necessary
    }
  })
  socket.on("!ubit", (data) => { self.ubit.handle_message(data)})

  self.add_message_handler = (message, callback) => {
    message = "$" + message
    socket.on(message, (data) => {
      callback(data.val)
    })
    destructor.add( () => {
      socket.off(message, callback)
    })
  }

  self.send_message = function(message, val, host='', type='broadcast') {
    fetch('/message/' + message, { method: 'POST',
      body: JSON.stringify({ 
        'val':val, 'host':host, 'local':type == 'local', 'socketId':socket.id 
      }),
      headers: {"Content-Type": "application/json"}
    })
  }

  self.idle_reset = function () {
    if (idle_reset_ms > 0) {
      clearTimeout(idle_callback_id)
      idle_callback_id = setTimeout(self.idle_callback, idle_reset_ms)
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

  self.add_handler = function (event, callback) {
    document.addEventListener(event, callback)
    destructor.add( () => {
      document.removeEventListener(event, callback)
    })
  }

  self.add_scaled_handler = function (event_name, callback, scaler) {
    let last_value = null
    let handler = function (ev) {
      let value = scaler(ev.detail)
      if (value !== null) {
        if (value != last_value) {
          last_value = value
          callback(value)
        }
      }
    }
    quando.add_handler(event_name, handler)
  }

  self.new_scaler = function (min, max, inverted = false) {
    return function (value) {
      // convert to range 0 to 1 for min to max
      let result = (value - min) / (max - min)
      result = Math.min(1, result)
      result = Math.max(0, result)
      if (inverted) {
        result = 1 - result
      }
      return result
    }
  }

  self.new_angle_scaler = function (mid, plus_minus, inverted = false) {
    let mod = function(x, n) {
        return ((x%n)+n)%n
    }
    let last_result = 0
    let crossover = mod(mid+180, 360)
    // i.e. 25% of the non used range
    let crossover_range = (180 - Math.abs(plus_minus)) / 4
    return function (value) {
      let x = mod(value - mid, 360)
      if (x > 180) { x -= 360}
      let result = (x + plus_minus) / (2 * plus_minus)
      if (inverted) {
        result = 1 - result
      }
      if ((result < 0) || (result > 1)) { // i.e. result is out of range
            // identify if result should be used
            let diff = Math.abs(crossover - mod(value, 360))
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

  self.cursor_up_down = function (mid, range, inverted, y) {
    let min = mid-range
    let max = mid+range
    min /= 100
    max /= 100
    if (y === false) {
      y = (min + max)/2
    }
    if (!inverted) {
      y = 1 - y // starts inverted
    }
    let scr_min = min * _displayHeight()
    let scr_max = max * _displayHeight()
    self._y = scr_min + (y * (scr_max-scr_min))
    _cursor_adjust()
  }

  self.cursor_left_right = function (mid, range, inverted, x) {
    let min = mid-range
    let max = mid+range
    min /= 100
    max /= 100
    if (x === false) {
      x = (min + max)/2
    }
    if (inverted) {
      x = 1 - x // starts normal
    }
    let scr_min = min * (_displayWidth()-1)
    let scr_max = max * (_displayWidth()-1)
    self._x = scr_min + (x * (scr_max-scr_min))
    _cursor_adjust()
  }

  self.idle = function (count, units, idle_fn, active_fn) {
    clearTimeout(idle_callback_id)
    let time_secs = idle_reset_ms = self.time.units_to_ms(units, count)
    self.idle_callback = () => {
      idle_reset_ms = 0 // why - surely I need to intercept self.idle_reset
            // actually - this will work to force self.idle_reset to call idle_active_callback instead
      idle_fn()
    }
    self.idle_active_callback = () => {
      clearTimeout(idle_callback_id)
      idle_reset_ms = time_secs // resets to idle detection
      idle_callback_id = setTimeout(self.idle_callback, idle_reset_ms)
            // so, restarts timeout when active
      active_fn()
    }
    idle_callback_id = setTimeout(self.idle_callback, idle_reset_ms)
  }

  function _set_or_append_tag_text(txt, tag, append) {
    var elem = document.getElementById(tag)
    if (append) {
      txt = elem.innerHTML + txt
    }
      if (txt) {
      elem.style.visibility = 'visible'
    } else {
      elem.style.visibility = 'hidden'
      txt = ''
    }
    elem.innerHTML = txt
  }
  
  self.title = (text = '', append = false) => {
    _set_or_append_tag_text(text, 'quando_title', append)
  }

  self.text = (text = '', append = false) => {
    _set_or_append_tag_text(text, 'quando_text', append)
  }

  self.display = function (key, fn) { // Yes this is all of it...
    _displays.set(key, fn)
  }

  self._removeFocus = function () {
    let focused = document.getElementsByClassName('focus')
    for (let focus of focused) {
      focus.classList.remove('focus')
      focus.removeEventListener('transitionend', self._handle_transition)
    }
  }
  self._handle_transition = function (ev) {
    ev.target.click()
  }

  self.startDisplay = function () {
    setTimeout( () => {
      self.style.set(self.style.DEFAULT, '#cursor', 'background-color', 'rgba(255, 255, 102, 0.7)')
      self.style.set(self.style.DEFAULT, '#cursor', 'width', '4.4vw')
      self.style.set(self.style.DEFAULT, '#cursor', 'height', '4.4vw')
      self.style.set(self.style.DEFAULT, '#cursor', 'margin-left', '-2.2vw')    
      self.style.set(self.style.DEFAULT, '#cursor', 'margin-top', '-2.2vw')    
      document.querySelector('body').addEventListener('contextmenu', // right click title to go to setup
              function (ev) {
                ev.preventDefault()
                window.location.href = '../../client/setup.html'
                return false
              }, false)
      exec() // this is the function added by the generator
      let first = _displays.keys().next()
      if (first && !first.done) {
        self.showDisplay(first.value) // this runs the very first display :)
      }
    }, 0)
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

  self.showDisplay = function (id) {
    if (_current_display_id != id) {
      // perform any destructors - which will cancel pending events, etc.
      // assumes that display is unique...
      destructor.destroy()
      // Clear current labels, title and text
      document.getElementById('quando_labels').innerHTML = ''
      self.title()
      self.text()
      //clear AR 
  //    quando.ar.clear()
  //        self.video() removed to make sure video can continue playing between displays
      self.style.reset()
      _current_display_id = id
      // Find display and execute...
      _displays.get(id)()
    }
  }

  self.addLabel = function (id, padding_size, padding_location, title) {
    self.addLabelStatement(title, padding_size, padding_location, () => { setTimeout( () => { quando.showDisplay(id) }, 0) })
  }

  function _add_padding_elements(parent, padding_size) {
    switch (padding_size) {
      case 'none':
        break;
      case 'large':
        parent.appendChild(document.createElement('br'))
        // Deliberate drop through to append more line breaks
      case 'medium':
        parent.appendChild(document.createElement('br'))
        // Deliberate drop through
      case 'small':
        parent.appendChild(document.createElement('br'))
    }
  }

  self.addLabelStatement = function (title, padding_size, padding_location, fn) {
    let elem = document.getElementById('quando_labels')
    if (padding_location.match(/^(before|both)$/)) {
      _add_padding_elements(elem, padding_size)
    }
    let div = document.createElement('br') // new element
    // Show space when no title
    if (title != "") { // empty title shows empty space
      div = document.createElement('div')
      div.className = 'quando_label'
      div.innerHTML = title
      div.setAttribute('id', 'label'+title)
      div.onclick = fn
    }
    elem.appendChild(div)
    if (padding_location.match(/^(after|both)$/)) {
      _add_padding_elements(elem, padding_size)
    }
  }

  self.promptInput = function() {
    let input = document.getElementById('imp')
    // console.log("inp=" + input)
    if (input == null) {
      let elem = document.getElementById('quando_labels')
      let div = document.createElement('div')
      input = document.createElement('input')
      let button = document.createElement('button')
      button.setAttribute('id', 'inpButton')
      input.setAttribute('id', 'inp')
  
      div.className = 'quando_label'
      input.type = "text"
      input.className = "quando_input"
      button.innerHTML = "Submit"
  
      div.appendChild(input)
      div.appendChild(button)
      elem.appendChild(div)
    }
  }

  function _degrees_to_radians (degrees) {
    let radians = Math.PI * degrees / 180
    return radians
  }

  self.convert_angle = (val, mid, range, inverted) => {
    if (val === false) { val = 0.5 }
    if (inverted) { val = 1 - val }
    let min = _degrees_to_radians(mid - range)
    let max = _degrees_to_radians(mid + range)
    return min + (val * (max-min))
  }

  self.convert_linear = (val, mid, range, inverted) => {
    if (val === false) { val = 0.5 }
    if (inverted) { val = 1 - val }
    let min = mid - range
    let max = mid + range
    return min + (val * (max-min))
  }

  self.prompt = (txt, callback) => {
    callback(prompt(text.decode(txt)))
  }

  self.alert = (txt, callback) => {
    callback(text.decode(alert(txt)))
  }

// N.B. the next two variables MUST be Global/var
var val = false // force handlers to manage when not embedded
var txt = false // assume default is ignore

if (document.title == "{{ title }}") { // this was opened by Editor >> Test
  document.title = "TEST"
  let script = document.getElementById("quando_script")
  if (script) {
    script.parentNode.removeChild(script)
  }
  let exec = window.opener.document['index'].client_script
  // note that window.opener.index doesn't exist...
  eval("window['exec'] =  () => {\n" + exec + "\n}")
}
