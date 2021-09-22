# For v2 micro:bit
from microbit import *

class COMMS: # character
    BUTTON_A = 'a'
    BUTTON_B = 'b'
    FACE_UP = '^'
    FACE_DOWN = 'v'
    LEFT = '<'
    RIGHT = '>'
    UP = 'B'
    DOWN = 'F'

def gesture():
    while True:
        msg = ""
        if button_a.is_pressed():
            msg += COMMS.BUTTON_A
        if button_b.is_pressed():
            msg += COMMS.BUTTON_B

        if pin0.is_touched():
            msg += '0'
        if pin1.is_touched():
            msg += '1'
        if pin2.is_touched():
            msg += '2'
        gest = accelerometer.current_gesture()
        if gest == 'face up':
            msg += COMMS.FACE_UP
        elif gest == 'face down':
            msg += COMMS.FACE_DOWN
        elif gest == 'up':
            msg += COMMS.UP
        elif gest == 'down':
            msg += COMMS.DOWN
        elif gest == 'left':
            msg += COMMS.LEFT
        elif gest == 'right':
            msg += COMMS.RIGHT
        # N.B. Can fall through when in between directions...
        if msg != "":
            display.show(msg[0])
            print(msg)
            sleep(40) # 25 FPS
    return # never does

# Main program
print('{"started":"true"}')
image = Image("08008:80800:08808:00800:88008")
display.show(image)
pin0.set_touch_mode(pin0.CAPACITIVE)
pin1.set_touch_mode(pin1.CAPACITIVE)
pin2.set_touch_mode(pin2.CAPACITIVE)
sleep(750)
gesture()


# def visitor_sense(): loop this:
#        if (pin0.read_digital() == 1):
#           # print something
#elif button_a.is_pressed() and not button_b.is_pressed():
#    visitor_sense()
