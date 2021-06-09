from __main__ import app

from flask import request
import server.common
import pynput # Fallback for MacOS, Linux

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


@app.route('/control/type', methods=['POST'])
def type():
    data = server.common.decode_json_data(request)
    for ch in data:
        write_char(ch)
    return ""