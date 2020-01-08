(() => {
  let quando = this['quando']
  if (!quando) {
    alert('Fatal Error: mouse must be included after quando_browser')
  }
  let self = quando.mouse = {}
  let mouse_move_x = {}
  let mouse_move_y = {}
  let last_x = false
  let last_y = false

  function handle_mouse_xy(event) {
    let button_down = false
    if (event.buttons % 2) { // i.e. odd - which means left button held down
      button_down = true
    }
    if (event.clientX != last_x) {
      let val = event.clientX / (window.innerWidth-1)
      for (let id in mouse_move_x) {
        mouse_move_x[id](val, button_down)
      }
      last_x = event.clientX
    }
    if (event.clientY != last_y) {
      // invert the mouse coordinates so up screen is positive
      let val = 1 - (event.clientY / (window.innerHeight-1))
      for (let id in mouse_move_y) {
        mouse_move_y[id](val, button_down)
      }
      last_y = event.clientY
    }
  }

  function _handleXY(id, button_down, handlers, middle, plus_minus, inverted, callback) {
    let min = (middle - plus_minus)/100
    let max = (middle + plus_minus)/100
    handlers[id] = (val, btn)=>{
      if (btn == button_down) {
        if (inverted) { val = 1-val }
        if ((val >= min) && (val <= max)) {
          let v = (val-min)/(max-min)
          callback(v)
        }
      }
    }
    quando.destructor.add(() => {
      delete handlers[id]
    })
  }

  self.handleX = (id, button_down, middle, plus_minus, inverted, callback) => {
    _handleXY(id, button_down, mouse_move_x, middle, plus_minus, inverted, callback)
  }

  self.handleY = (id, button_down, middle, plus_minus, inverted, callback) => {
    _handleXY(id, button_down, mouse_move_y, middle, plus_minus, inverted, callback)
  }

  addEventListener('mousemove', handle_mouse_xy)
})()