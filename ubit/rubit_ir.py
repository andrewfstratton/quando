# Remote micro:bit - boot with a button pressed for passive infrared, boot without for face up/down 
import radio
from microbit import *

# Common - easier this way due to simple build process
RADIO_IR = 'I'
RADIO_BUTTON_A = 'A'
RADIO_BUTTON_B = 'B'
RADIO_FACE_UP = 'U'
RADIO_FACE_DOWN = 'D'
RADIO_LEFT = 'L'
RADIO_RIGHT = 'R'
RADIO_HEADING = 'H'
RADIO_TEST = '?' # uncommon

def test():
    while True:
        radio.send(RADIO_TEST)
        sleep(500)

def gesture():
    last_heading = 999
    resend_up = 0
    resend_down = 0
    resend_left = 0
    resend_right = 0
    while True:
        heading = compass.heading()
        if (heading != last_heading) :
            diff = heading - last_heading
            if diff > 360:
                diff -= 360
            if (abs(heading - last_heading))>10:
                radio.send(RADIO_HEADING+str(heading))
                last_heading = heading
            display.show('*')
        if accelerometer.is_gesture('face up'):
            if resend_up == 50:
                resend_up = 0
            if resend_up == 0:
                display.show('^')
                radio.send(RADIO_FACE_UP)
                resend_down = resend_left = resend_right = 0
            resend_up += 1
        if accelerometer.is_gesture('face down'):
            if resend_down == 50:
                resend_down = 0
            if resend_down == 0:
                display.show('v')
                radio.send(RADIO_FACE_DOWN)
                resend_left = resend_up = resend_right = 0
            resend_down += 1
        if accelerometer.is_gesture('left'):
            if resend_left == 50:
                resend_left = 0
            if resend_left == 0:
                display.show('<')
                radio.send(RADIO_LEFT)
                resend_down = resend_up = resend_right = 0
            resend_left += 1
        if accelerometer.is_gesture('right'):
            if resend_right == 50:
                resend_right = 0
            if resend_right == 0:
                display.show('>')
                radio.send(RADIO_RIGHT)
                resend_down = resend_up = resend_left = 0
            resend_right += 1
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
            radio.send(RADIO_IR)
            ir = 10 # 2.5 seconds
        else:
            if ir > 0:
                ir -= 1
                if ir == 0:
                    display.set_pixel(1,0,0)
        if button_a.was_pressed():
            radio.send(RADIO_BUTTON_A)
            display.set_pixel(2,0,4)
        else:
            display.set_pixel(2,0,0)
    
        if button_b.was_pressed():
            radio.send(RADIO_BUTTON_B)
            display.set_pixel(3,0,4)
        else:
            display.set_pixel(3,0,0)
        sleep(100)
    return # never does


#Main program
radio.on()
    
if button_a.is_pressed():
    visitor_sense()
elif button_b.is_pressed():
    test()
else:
    gesture()
    
