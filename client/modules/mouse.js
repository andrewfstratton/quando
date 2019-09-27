(() => {
  let quando = this['quando']
  if (!quando) {
    alert('Fatal Error: mouse must be included after quando_browser')
  }
  let self = quando.mouse = {}
  let mouse_move_x = []
  let mouse_move_y = []
  let last_x = false
  let last_y = false

  function handle_mouse_xy(event) {
    let button_down = false
    if (event.buttons % 2) { // i.e. odd - which means left button held down
      button_down = true
    }
    if (event.screenX != last_x) {
      let val = event.screenX / window.screen.width
      for (let handler in mouse_move_x) {
        mouse_move_x[handler](val, button_down)
      }
      last_x = event.screenX
    }
    if (event.screenY != last_y) {
      let val = event.screenY / window.screen.height
      for (let handler in mouse_move_y) {
        mouse_move_y[handler](val, button_down)
      }
      last_y = event.screenY
    }
  }

  function _handleXY(button_down, push_to, middle, plus_minus, inverted, callback) {
    let min = (middle - plus_minus)/100
    let max = (middle + plus_minus)/100
    push_to.push((val, btn)=>{
      if (btn == button_down) {
        if (inverted) { val = 1-val }
        if ((val >= min) && (val <= max)) {
          let v = (val-min)/(max-min)
          callback(v)
        }
      }
    })
  }

  self.handleX = (button_down, middle, plus_minus, inverted, callback) => {
    _handleXY(button_down, mouse_move_x, middle, plus_minus, inverted, callback)
  }

  self.handleY = (button_down, middle, plus_minus, inverted, callback) => {
    _handleXY(button_down, mouse_move_y, middle, plus_minus, !inverted, callback)
    // Note: deliberately invert mouse to get up screen positive?!
  }

  addEventListener('mousemove', handle_mouse_xy)
})()