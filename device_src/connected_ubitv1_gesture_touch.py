# For v1 micro:bit
from microbit import *

LOOKUP = {
    'face up':'^',
    'face down':'v',
    'left':'<',
    'right':'>',
    'up':'B',
    'down':'F'
    }

def gesture():
    while True:
        msg = ""
        if button_a.is_pressed():
            msg += 'a'
        if button_b.is_pressed():
            msg += 'b'

        if pin0.is_touched():
            msg += '0'
        if pin1.is_touched():
            msg += '1'
        if pin2.is_touched():
            msg += '2'
        gest = accelerometer.current_gesture()
        msg += LOOKUP.get(gest, "")
        # N.B. Can fall through when in between directions...
        if msg != "":
            display.show(msg[0])
            print(msg)
            sleep(40) # 25 FPS
    return # never does

# Main program
uart.init(115200,8,None,1)
print('{"started":"true"}')
image = Image("08008:80800:08808:00800:88008")
display.show(image)
sleep(750)
gesture()


# def visitor_sense(): loop this:
#        if (pin0.read_digital() == 1):
#           # print something
#elif button_a.is_pressed() and not button_b.is_pressed():
#    visitor_sense()
