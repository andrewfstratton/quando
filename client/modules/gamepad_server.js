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
let gamepads = [] // last state or empty if disconnected

function _handle(handlers, block_id, button_id, down_up_either, callback) {
  let button_handler_list = handlers[button_id]
  if (button_handler_list === undefined) {
    button_handler_list = {}
    handlers[button_id] = button_handler_list
  }
  button_handler_list[block_id] = {'down_up':down_up_either, 'callback':callback}
  destructor.add( () => {
    delete button_handler_list[block_id]
  })
}

self.handleButton = (block_id, button_id, down_up, callback) => {
    let down_up_either = DOWN_UP[down_up]
    _handle(button_handlers, block_id, button_id, down_up_either, callback)
}

// function _getGamepad() {
//     let list = navigator.getGamepads()
//     // return first valid gamepad found
//     for (let gamepad of list) {
//         if (gamepad) {
//             return gamepad
//         }
//     }
//     return false
// }

// function _updateButtons(gamepad) {
//     let buttons
//     if (gamepad) {
//         buttons = gamepad.buttons
//     } else {
//         buttons = [...last_buttons] // copy
//         for (let i = 0; i < buttons.length; i++) {
//             buttons[i] = {'value' : 0} // i.e. reset since disconnected
//         }
//     }
//     for (let i = 0; i < buttons.length; i++) {
//         // Check for change
//         let on_off = buttons[i].value
//         if (on_off != last_buttons[i]) {
//             last_buttons[i] = on_off // update value
//             let handlers = button_handlers[i]
//             if (handlers !== undefined) {
//                 for(const i in handlers) {
//                     const handler = handlers[i]
//                     let callback = handler['callback']
//                     let down_up = handler['down_up']
//                     if (on_off > 0) { // now pressed
//                         if ((down_up == DOWN) || (down_up == EITHER)) {
//                             callback(on_off)
//                         }
//                     } else { // now released
//                         if ((down_up == UP) || (down_up == EITHER)) {
//                             callback(on_off)
//                         }
//                     }
//                 }
//             }
//         }
//     }
//     // remove array in case different length for next gamepad
//     if (!gamepad && (last_buttons.length != 0)) {
//         last_buttons = []
//     }
// }

// // N.B. The triggers are added as axes, but actually held as button handlers
// const AXIS_MAP = {true:{'x':0, 'y':1,'trigger':6}, false:{'x':2, 'y':3,'trigger':7}}

// self.handleAxis = (block_id, left, axis, middle, plus_minus, ignore, inverted, callback) => {
//   middle /= 100
//   plus_minus /= 100
//   ignore /= 100
//   let half_ignore = ignore / 2
//   let min_max_scaler = quando.new_scaler(middle-plus_minus, middle+plus_minus, inverted)
//   let axis_id = AXIS_MAP[left][axis]
//   let ignore_handler = (val) => {
//     let new_val = min_max_scaler(val)
//     // Adjust for deadzone if not at limit
//     if ((new_val > 0) || (new_val < 1)) {
//       let fraction_from_middle = Math.abs(0.5 - new_val) *2 // i.e. /0.5
//       if (fraction_from_middle <= ignore) { // or could compare against half_ignore
//         new_val = 0.5
//       } else { // scale the remaining fraction
//         if (new_val < 0.5) { // i.e. below middle
//             new_val /= 1-ignore
//         } else { // above middle
//             let above = new_val - 0.5 - half_ignore
//             above /= 1-ignore // scale
//             new_val = above + 0.5
//         }
//       }
//     }
//     return callback(new_val)
//   }
//   _handle(axis_handlers, block_id, axis_id, EITHER, ignore_handler) 
// }

// self.handleTrigger = (block_id, left, min, max, inverted, callback) => {
//   min /= 100
//   max /= 100
//   let trigger_id = AXIS_MAP[left]['trigger']
//   let min_max_scaler = quando.new_scaler(min, max, inverted)
//   let handler = (val) => {
//     let new_val = min_max_scaler(val)
//     return callback(new_val)
//   }
//   _handle(button_handlers, block_id, trigger_id, EITHER, handler) 
// }

// function _updateAxes(gamepad) {
//     let axes
//     if (gamepad) {
//         axes = gamepad.axes
//     } else {
//         axes = [...last_axes] // copy
//         for (let i = 0; i < axes.length; i++) {
//             axes[i] = 0 // i.e. reset since disconnected
//         }
//     }
//     for (let i=0; i<axes.length; i++) {
//         // Check for change in value
//         let value = axes[i]
//         if (value != last_axes[i]) {
//             last_axes[i] = value // update value
//             // Now convert to 0 to 1
//             value = (value+1)/2
//             // if x axis, invert
//             if ((i % 2) == 1) {
//                 value = 1 - value
//             }
//             let handlers = axis_handlers[i]
//             if (handlers !== undefined) {
//                 for(const i in handlers) {
//                     let callback = handlers[i]['callback']
//                     callback(value)
//                 }
//             }
//         }
//     }
//     // remove array in case different length for next gamepad
//     if (!gamepad && (last_axes.length != 0)) {
//         last_axes = []
//     }
// }

// function _update() {
//   let gamepad = _getGamepad()
//   _updateButtons(gamepad)
//   _updateAxes(gamepad)
// }

// setInterval(_update, 1/60 * 1000) // 60 times a second
const BUTTON_TO_MASK = [0x1000, 0x2000, 0x4000, 0x8000, // ABXY
                        0x0100, 0x0200, 0, 0, // l_bump, r-bump
                        0x0020, 0x0010, 0x0040, 0x0080, // Back Start L_stick r_stick
                        0x0001, 0x0002, 0x0004, 0x0008 // up down left right
]

function createGamepad(data) {
    let gamepad = {}
    if (gamepad.drop) {
        gamepad = null
    } else {
        let mask = data.mask
        gamepad.buttons = [] // n.b. stored as array of booleans, not as pressed/value object
        for (let i=0; i<BUTTON_TO_MASK.length; i++) {
            let pressed  = (BUTTON_TO_MASK[i] & mask) > 0 // i.e. true when mask bit is set
            gamepad.buttons[i] = pressed
        }
        // gamepad.l_trigger = data.l_trigger
        // gamepad.r_trigger = data.r_trigger
        // gamepad.l_x = data.l_x
        // gamepad.r_x = data.r_x
        // gamepad.l_y = data.l_y
        // gamepad.r_y = data.r_y
    }
    return gamepad
}

self.handle_message = (data) => {
    let id = data.id
    let gamepad // null
    if (data.drop) {
        console.log("Disconnected #", id)
        delete gamepads[data.id]
    } else {
        console.log("Update from #", id)
        gamepad = createGamepad(data)
        console.log(data, gamepad)
    }
    _handle_button_update(gamepad, id)
    gamepads[id]  = gamepad
}

function _handle_button_update(gamepad, id) {
    let last_gamepad = gamepads[id]
    for (let i = 0; i < BUTTON_TO_MASK.length; i++) {
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