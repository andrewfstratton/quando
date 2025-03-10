import * as destructor from "./destructor.js";

const quando = window['quando']
if (!quando) {
  alert('Fatal Error: gamepad_server.js must be included after quando_browser')
}

if (!quando.gamepad) {
  alert('Fatal Error: gamepad_server.js must be included after gamepad.js')
}

const EITHER = -1, UP = 0, DOWN = 1
const DOWN_UP = {'down': DOWN, 'up': UP, 'either': EITHER}

let self = quando.gamepad.server = {}
let button_handlers = {}
let axis_handlers = {}
let gamepads = [] // last state or empty if disconnected

function _handle(handlers, block_id, button_axis_id, down_up_either, callback) {
  let handler_list = handlers[button_axis_id]
  if (handler_list === undefined) {
    handler_list = {}
    handlers[button_axis_id] = handler_list
  }
  handler_list[block_id] = {'down_up':down_up_either, 'callback':callback}
  destructor.add( () => {
    delete handler_list[block_id]
  })
}

self.handleButton = (block_id, button_id, down_up, callback) => {
    let down_up_either = DOWN_UP[down_up]
    _handle(button_handlers, block_id, button_id, down_up_either, callback)
}

// N.B. The triggers are managed as axes
const AXIS_MAP = {true:{'x':2, 'y':4,'trigger':0}, false:{'x':3, 'y':5,'trigger':1}}

self.handleAxis = (block_id, left, axis, middle, plus_minus, ignore, inverted, callback) => {
  middle /= 100
  plus_minus /= 100
  ignore /= 100
  let half_ignore = ignore / 2
  let min_max_scaler = quando.new_scaler(middle-plus_minus, middle+plus_minus, inverted)
  let axis_id = AXIS_MAP[left][axis]
  let ignore_handler = (val) => {
    let new_val = min_max_scaler(val)
    // Adjust for deadzone if not at limit
    if ((new_val > 0) || (new_val < 1)) {
      let fraction_from_middle = Math.abs(0.5 - new_val) *2 // i.e. /0.5
      if (fraction_from_middle <= ignore) { // or could compare against half_ignore
        new_val = 0.5
      } else { // scale the remaining fraction
        if (new_val < 0.5) { // i.e. below middle
            new_val /= 1-ignore
        } else { // above middle
            let above = new_val - 0.5 - half_ignore
            above /= 1-ignore // scale
            new_val = above + 0.5
        }
      }
    }
    return callback(new_val)
  }
  _handle(axis_handlers, block_id, axis_id, EITHER, ignore_handler) 
}

self.handleTrigger = (block_id, left, min, max, inverted, callback) => {
  min /= 100
  max /= 100
  let trigger_id = AXIS_MAP[left]['trigger']
  let min_max_scaler = quando.new_scaler(min, max, inverted)
  let handler = (val) => {
    let new_val = min_max_scaler(val)
    return callback(new_val)
  }
  _handle(axis_handlers, block_id, trigger_id, EITHER, handler) 
}

const BUTTON_MASK = [0x1000, 0x2000, 0x4000, 0x8000, // ABXY
                        0x0100, 0x0200, 0, 0, // l_bump, r-bump
                        0x0020, 0x0010, 0x0040, 0x0080, // Back Start L_stick r_stick
                        0x0001, 0x0002, 0x0004, 0x0008 // up down left right
] // HOME/GUIDE would map to 0x0400, but doesn't work at present - needs C++ call?

const L_TRIGGER = 0, R_TRIGGER = 1, L_X = 2, R_X = 3, L_Y = 4, R_Y = 5, AXES = 6

function _axis_value(value, trigger = false) {
    let result = 0.5
    if (trigger) {
        result = 0
    }
    if (value) {
        if (trigger) { // 8 bit unsigned - can be 0 to 255
            result = value / 255 // to give 0 to 1
        } else { // 16 bit signed - can be -32768 to 32767
            let val = value
            if (val == -32768) val++ // so range is now -32767 to +32767, i.e. equal around 0
            val += 32767 // now 0 to 65534
            result = val / 65534 // deliberately not 65535?!
        }
    }
    return result
}

function createGamepad(data) {
    let gamepad = {}
    if (gamepad.drop) {
        gamepad = null
    } else {
        let mask = data.mask
        gamepad.buttons = [] // n.b. stored as array of booleans, not as pressed/value object
        for (let i=0; i<BUTTON_MASK.length; i++) {
            let pressed  = (BUTTON_MASK[i] & mask) > 0 // i.e. true when mask bit is set
            gamepad.buttons[i] = pressed
        }
        gamepad.axis = []
        // axes have value of 0 if not sent
        gamepad.axis[L_TRIGGER] = _axis_value(data.l_trigger, true)
        gamepad.axis[R_TRIGGER] = _axis_value(data.r_trigger, true)
        gamepad.axis[L_X] = _axis_value(data.l_x)
        gamepad.axis[R_X] = _axis_value(data.r_x)
        gamepad.axis[L_Y] = _axis_value(data.l_y)
        gamepad.axis[R_Y] = _axis_value(data.r_y)
        console.log(gamepad.axis)
    }
    return gamepad
}

self.handle_message = (data) => {
    let id = data.id
    let gamepad // null
    if (data.drop) {
        // console.log("Disconnected #", id)
        delete gamepads[data.id]
    } else {
        gamepad = createGamepad(data)
        // console.log(data, gamepad)
    }
    _handle_button_update(gamepad, id)
    _handle_axes_update(gamepad, id)
    gamepads[id]  = gamepad
}

function _handle_axes_update(gamepad, id) {
    let last_gamepad = gamepads[id]
    for (let i = 0; i < AXES; i++) {
        let val = gamepad.axis[i]
        let last_val = last_gamepad?.axis[i]
        if (val != last_val) {
            let handlers = axis_handlers[i]
            if (handlers !== undefined) {
                for(const i in handlers) {
                    const handler = handlers[i]
                    let callback = handler['callback']
                    callback(val)
                }
            }
        }
    }
    // console.log(gamepad.axes)
}

function _handle_button_update(gamepad, id) {
    let last_gamepad = gamepads[id]
    for (let i = 0; i < BUTTON_MASK.length; i++) {
        // Check for change
        let pressed = gamepad?gamepad.buttons[i]:false // false when gamepad is null or button not pressed
        let last_pressed = last_gamepad?(last_gamepad.buttons[i] == true):false
        if (pressed != last_pressed) {
            let handlers = button_handlers[i]
            if (handlers !== undefined) {
                for(const i in handlers) {
                    const handler = handlers[i]
                    let callback = handler['callback']
                    let down_up = handler['down_up']
                    let on_off = Number(pressed) // convert to 0/1 for false/true
                    if (pressed) { // now pressed
                        if ((down_up == DOWN) || (down_up == EITHER)) {
                            callback(on_off)
                        }
                    } else { // now released
                        if ((down_up == UP) || (down_up == EITHER)) {
                            callback(on_off)
                        }
                    }
                }
            }
        }
    }
}