from __main__ import app

from flask import request
import pynput # Fallback for MacOS, Linux

# maps keys from directinput name to pynput attribute
KEY_MAP = {
 "pageup": "page_up",
 "pagedown": "page_down",
 "printscreen": "print_screen",
 "altright": "alt_r",
 "shiftright": "shift_r",
 "ctrlright": "ctrl_r",
 "win": "cmd",
 "winright": "cmd_r",
 "capslock": "caps_lock",
 "numlock": "num_lock",
 "scrolllock": "scroll_lock",
 "apps": "menu"
}

key_controller = False

try:
    import pydirectinput # only works for windows
    pydirectinput.PAUSE = 0.05 # N.B. If set as 0, doesn't register within games
    import keyboard as kbd # needed to detect if shift pressed...
except ImportError:
    pydirectinput = False
    print("pydirectinput or keyboard not found - using pynput instead")
    key_controller = pynput.keyboard.Controller() # Won't be used if pydirectinput is available

def write_char(ch):
    upper = ch.isupper()
    if pydirectinput:
        if pydirectinput.KEYBOARD_MAPPING.get(ch.lower(), False):
            ch = ch.lower()
            if kbd.is_pressed("shift"):
                upper = False
            if upper:
                pydirectinput.keyDown('shift')
            pydirectinput.write(ch, interval=0.0)
            if upper:
                pydirectinput.keyUp('shift')
        else:
            kbd.write(ch, restore_state_after=True)
    elif key_controller: # Use pynput
        key_controller.type(ch)

def key_press_release(name, press):
    if pydirectinput:
        if name.isupper():
            name = name.lower()
        if pydirectinput.KEYBOARD_MAPPING.get(name, False):
            if press:
                pydirectinput.keyDown(name)
            else:
                pydirectinput.keyUp(name)
        else:
            print("NYI: ", name)
    elif key_controller: # i.e. can use pynput
        name = KEY_MAP.get(name, name)
        key = getattr(pynput.keyboard.Key, name, False)
        if key:
            if press:
                key_controller.press(key)
            else:
                key_controller.release(key)
        else:
            print("NYI: ", name)

@app.route('/control/type', methods=['POST'])
def type():
    # data = server.common.decode_json_data(request)
    for ch in data:
        write_char(ch)
    return ""

@app.route('/control/key', methods=['POST'])
def key():
    # data = server.common.decode_json_data(request)
    key_press_release(data['key'], data['press'])
    return ""