# Remote micro:bit - boot with a button pressed for passive infrared, boot without for face up/down 
import radio
from microbit import *

def gesture():
    while True:
        if accelerometer.is_gesture('face up'):
            display.show('^')
            radio.send('face_up')
        elif accelerometer.is_gesture('face down'):
            display.show('v')
            radio.send('face_down')
        else:
            display.show('-')
        sleep(20)
    return # never does

def visitor_sense():
    toggle = 0
    ir = 0
    while True:
        display.set_pixel(0,0,toggle)
        if toggle == 0:
            toggle = 9
        else:
            toggle = toggle -1
        if (ir == 0) and (pin0.read_digital() == 1):
            display.set_pixel(1,0,4)
            radio.send('ir')
            ir = 10 # 2.5 seconds
        else:
            if ir > 0:
                ir -= 1
                if ir == 0:
                    display.set_pixel(1,0,0)
        if button_a.was_pressed():
            radio.send('button_a')
            display.set_pixel(2,0,4)
        else:
            display.set_pixel(2,0,0)
    
        if button_b.was_pressed():
            radio.send('button_b')
            display.set_pixel(3,0,4)
        else:
            display.set_pixel(3,0,0)
        sleep(100)
    return # never does


#Main program
radio.on()
    
if button_a.is_pressed():
    visitor_sense()
else:
    gesture()
    
