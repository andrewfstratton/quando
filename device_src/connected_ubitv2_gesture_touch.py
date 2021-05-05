# For v2 micro:bit
# import math
from microbit import *
import machine

class COMMS: # character, json
    IR = (Image.HEART, 'ir:true\n')
    BUTTON_A = ('a', 'Ba:true\n')
    BUTTON_B = ('b', 'Bb:true\n')
    FACE_UP = ('^', 'Or:"up"\n')
    FACE_DOWN = ('v', 'Or:"down"\n')
    LEFT = ('<', 'Or:"left"\n')
    RIGHT = ('>', 'Or:"right"\n')
    UP = ('B', 'Or:"backward"\n')
    DOWN = ('F', 'Or:"forward"\n')
PINS = [('0','P0:true\n'), ('1','P1:true\n'), ('2','P2:true\n')]
pin012 = [pin0, pin1, pin2]

def gesture():
    last_gesture = ""
    _p = [False, False, False]
    ticks = 0
    while True:
        msg = ""
        msg_a = COMMS.BUTTON_A[0]+':'+COMMS.BUTTON_A[1]
        msg_b = COMMS.BUTTON_B[0]+':'+COMMS.BUTTON_B[1]
        if button_a.was_pressed():
            msg = msg_a
            if button_b.is_pressed():
                msg += msg_b
        if button_b.was_pressed():
            msg = msg_b
            if button_a.is_pressed():
                msg += msg_a
        gest = accelerometer.current_gesture()
        p_comm = False
        for pin in range(3):
            if pin012[pin].is_touched():
                if not _p[pin]:
                    msg += PINS[pin][0]+':'+PINS[pin][1]
                    _p[pin] = True
            elif _p[pin]:
                _p[pin] = False
        if pin0.is_touched():
            # uart.init(115200)
            machine.reset()
        if gest == last_gesture:
            ticks += 1
            if ticks == 50:
                ticks=0
            else:
                sleep(20)
        else:
            last_gesture = gest
            ticks = 0
        if ticks == 0:
            comms = False
            if gest == 'face up':
                comms = COMMS.FACE_UP
            elif gest == 'face down':
                comms = COMMS.FACE_DOWN
            elif gest == 'up':
                comms = COMMS.UP
            elif gest == 'down':
                comms = COMMS.DOWN
            elif gest == 'left':
                comms = COMMS.LEFT
            elif gest == 'right':
                comms = COMMS.RIGHT
            if comms != False:
                display.show(comms[0])
                msg += comms[0]+':'+comms[1]
        if msg != "":
            messages = msg.split('\n')
            messages.pop() # drop the empty last one
            result = '{'
            for msg in messages:
                parts = msg.split(':')
                result += '"' + parts[1] + '":' + parts[2] + ','
                display.show(parts[0])
            result = result[:-1] + '}' # replace the last , with }
            print(result)
    return # never does

#Main program
print('{"started":"true"}')
image = Image("08008:80800:08808:00800:88008")
display.show(image)
for pin in pin012:
    pin.set_touch_mode(pin.CAPACITIVE)
# sleep(750)
gesture()


# def visitor_sense(): loop this:
#        if (pin0.read_digital() == 1):
#           COMMS.send(COMMS.IR)
#elif button_a.is_pressed() and not button_b.is_pressed():
#    visitor_sense()
