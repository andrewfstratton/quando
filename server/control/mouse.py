from pynput.mouse import Button, Controller

import tkinter

root = tkinter.Tk()
screen_width = root.winfo_screenwidth()
screen_height = root.winfo_screenheight()
mouse = Controller()
last_x, last_y = mouse.position

def move_to(x_val, y_val):
    global last_x, last_y
    print(last_x, last_y)
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

# move_to(0.5, -1)

def handle(data):
    x = -1
    if 'x' in data:
        x = float(data['x'])
    y = -1
    if 'y' in data:
        y = float(data['y'])
    move_to(x,y)
