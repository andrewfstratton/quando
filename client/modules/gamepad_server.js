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

const BUTTON_TO_MASK = [0x1000, 0x2000, 0x4000, 0x8000, // ABXY
                        0x0100, 0x0200, 0, 0, // l_bump, r-bump
                        0x0020, 0x0010, 0x0040, 0x0080, // Back Start L_stick r_stick
                        0x0001, 0x0002, 0x0004, 0x0008 // up down left right
]

const L_TRIGGER = 0, R_TRIGGER = 1, L_X = 2, R_X = 3, L_Y = 4, R_Y = 5, AXES = 6

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
        gamepad.axes = []
        // axes must have value of 0 if not sent
        gamepad.axes[L_TRIGGER] = data.l_trigger || 0
        gamepad.axes[R_TRIGGER] = data.r_trigger || 0
        gamepad.axes[L_X] = data.l_x || 0
        gamepad.axes[R_X] = data.r_x || 0
        gamepad.axes[L_Y] = data.l_y || 0
        gamepad.axes[R_Y] = data.r_y || 0
        console.log(gamepad.axes)
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