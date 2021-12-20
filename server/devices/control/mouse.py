from __main__ import app

from flask import request
import server.common

from pynput.mouse import Button, Controller

_mouse = Controller()
_last_x, _last_y = _mouse.position
_screen_width, _screen_height = server.common.get_tk_width_height()

def move_to(x_val, y_val):
    global _last_x, _last_y
    if x_val >= 0:
        x = int(_screen_width * x_val)
    else:
        x = _last_x
    if y_val >= 0:
        # invert since screen coordinates start at top left
        y_val = 1 - y_val
        y = int(_screen_height * y_val)
    else:
        y = _last_y
    _mouse.position = (x,y)
    (_last_x, _last_y) = (x,y)

def _press(button):
    # TODO Check mask for already pressed
    _mouse.press(button)

def _release(button):
    # TODO Check mask for already released
    _mouse.release(button)

def _act_on_button(data, key, button):
    press = data.get(key, None)
    if press != None:
        if press:
            _press(button)
        else:
            _release(button)

def handle(data):
    # Check movement
    x = float(data.get('x', -1))
    y = float(data.get('y', -1))
    if x >= 0 or y >= 0:
        move_to(x,y)

    # Check buttons
    _act_on_button(data, 'left', Button.left)
    _act_on_button(data, 'right', Button.right)
    _act_on_button(data, 'middle', Button.middle)

    return ""

@app.route('/control/mouse', methods=['POST'])
def mouse():
    data = server.common.decode_json_data(request)
    return handle(data)