from __main__ import app

from flask import request
import server.common
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

try:
    import pydirectinput # only works for windows
    pydirectinput.PAUSE = 0.05 # N.B. If set as 0, doesn't register within games
    import keyboard as kbd # needed to detect if shift pressed...
except ImportError:
    pydirectinput = False
    print("pydirectinput not found:")

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
    else:
        pynput.keyboard.Controller().type(ch)

def key_press_release(name, press):
    if pydirectinput:
        if pydirectinput.KEYBOARD_MAPPING.get(name, False):
            if press:
                pydirectinput.keyDown(name)
            else:
                pydirectinput.keyUp(name)
    else:
        name = KEY_MAP.get(name, name)
        key = getattr(pynput.keyboard.Key, name, False)
        if key:
            if press:
                pynput.keyboard.Controller().press(key)
            else:
                pynput.keyboard.Controller().release(key)
        else:
            print("NYI: ", name)

@app.route('/control/type', methods=['POST'])
def type():
    data = server.common.decode_json_data(request)
    for ch in data:
        write_char(ch)
    return ""

@app.route('/control/key', methods=['POST'])
def key():
    data = server.common.decode_json_data(request)
    key_press_release(data['key'], data['press'])
    return ""