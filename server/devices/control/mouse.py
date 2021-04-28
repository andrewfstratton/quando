from pynput.mouse import Button, Controller
import tkinter

root = tkinter.Tk()
screen_width = root.winfo_screenwidth()
screen_height = root.winfo_screenheight()
mouse = Controller()
last_x, last_y = mouse.position

def move_to(x_val, y_val):
    global last_x, last_y
    if x_val >= 0:
        x = int(screen_width * x_val)
    else:
        x = last_x
    if y_val >= 0:
        # invert since screen coordinates start at top left
        y_val = 1 - y_val
        y = int(screen_height * y_val)
    else:
        y = last_y
    mouse.position = (x,y)
    (last_x, last_y) = (x,y)

def press(button):
    # TODO Check mask for already pressed
    mouse.press(button)

def release(button):
    # TODO Check mask for already released
    mouse.release(button)

def _act_on_button(data, key, button):
    inp = data.get(key, 0)
    if inp > 0:
        press(button)
    elif inp < 0:
        release(button)

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
