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
    resend_count = 0
    last_msg = ""
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
        msg += LOOKUP.get(gest, "") # Note can be between directions...
        resend_count += 1
        if msg == last_msg:
            if resend_count >= 25: # i.e. resend every second
                if msg != "":
                    print(msg)
                resend_count = 0
        else:
            print(msg) # always send when different
            resend_count = 0
        if msg != "":
            display.show(msg[0])
        sleep(40) # 25 FPS
        last_msg = msg
    return # never does

# Main program
uart.init(115200,8,None,1)
print('{"started":"true"}')
image = Image("08008:80800:08808:00800:88008")
display.show(image)
# Enable three lines below for v2 capacitance touch
# pin0.set_touch_mode(pin0.CAPACITIVE)
# pin1.set_touch_mode(pin1.CAPACITIVE)
# pin2.set_touch_mode(pin2.CAPACITIVE)
sleep(750)
gesture()


# def visitor_sense(): loop this:
#        if (pin0.read_digital() == 1):
#           # print something
#elif button_a.is_pressed() and not button_b.is_pressed():
#    visitor_sense()
