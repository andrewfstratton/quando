import * as destructor from "./destructor.js";

const quando = window['quando']
if (!quando) {
  alert('Fatal Error: key must be included after quando_browser')
}
let self = quando.key = {}
let key_pressed = {}
let key_released = {}

function _keydown(event) {
  if (!event.repeat) {
    let down_handlers = key_pressed[event.key]
    for (let id in down_handlers) {
      down_handlers[id](event.ctrlKey, event.altKey)
    }
  }
}

function _keyup(event) {
  let up_handlers = key_released[event.key]
  for (let id in up_handlers) {
    up_handlers[id](event.ctrlKey, event.altKey)
  }
}

self.handleKey = ({id, key, down_up, ctrl=false, alt=false, special=false, callback}) => {
  if (["either", "down"].includes(down_up)) {
    let down_handlers = key_pressed[key]
    if (!down_handlers) {
      down_handlers = key_pressed[key] = {} // a map of possible handlers ...
    }
    // Note that ctrl/alt are ignored when a special key
    down_handlers[id]=(e_ctrl, e_alt) => { // Note that id is the unique block
      if (special || ((ctrl == e_ctrl) && (e_alt == alt))) {
        if (down_up == "either") {
          callback(1)
        } else {
          callback()
        }
      }
    }
    destructor.add(() => {
      delete down_handlers[id]
    })
  }
  if (["either", "up"].includes(down_up)) {
    let up_handlers = key_released[key]
    if (!up_handlers) {
      up_handlers = key_released[key] = {}
    }
    up_handlers[id]=(e_ctrl, e_alt) => {
      if (special || ((ctrl == e_ctrl) && (e_alt == alt))) {
        if (down_up == "either") {
          callback(0)
        } else {
          callback()
        }
      }
    }
    destructor.add(() => {
      delete up_handlers[id]
    })
  }
}

addEventListener('keydown', _keydown)
addEventListener('keyup', _keyup)