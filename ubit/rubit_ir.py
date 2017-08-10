# Remote micro:bit - boot with 'a' button pressed for passive infrared, boot without for face up/down 
import radio
from microbit import *

# Common - easier this way due to simple build process
RADIO_IR = 'I'
RADIO_BUTTON_A = 'A'
RADIO_BUTTON_B = 'B'
RADIO_FACE_UP = '^'
RADIO_FACE_DOWN = 'v'
RADIO_UP = 'U'
RADIO_DOWN = 'D'
RADIO_LEFT = 'L'
RADIO_RIGHT = 'R'
RADIO_HEADING = 'H'
RADIO_TEST = '?' # uncommon

resend_face_up=resend_face_down=resend_up=resend_down=resend_left=resend_right=0

def reset_resend():
    global resend_face_up, resend_face_down, resend_up, resend_down, resend_left, resend_right
    resend_face_up=resend_face_down=resend_up=resend_down=resend_left=resend_right=0

def heading():
    last_heading = 999
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
        sleep(20)
    return # never does

def gesture():
    global resend_face_up, resend_face_down, resend_up, resend_down, resend_left, resend_right
    while True:
        if accelerometer.is_gesture('face up'):
            if resend_face_up == 50:
                resend_face_up = 0
            if resend_face_up == 0:
                display.show('^')
                radio.send(RADIO_FACE_UP)
                reset_resend()
            resend_face_up += 1
        elif accelerometer.is_gesture('face down'):
            if resend_face_down == 50:
                resend_face_down = 0
            if resend_face_down == 0:
                display.show('v')
                radio.send(RADIO_FACE_DOWN)
                reset_resend()
            resend_face_down += 1
        if accelerometer.is_gesture('up'):
            if resend_up == 50:
                resend_up = 0
            if resend_up == 0:
                display.show('U')
                radio.send(RADIO_UP)
                reset_resend()
            resend_up += 1
        elif accelerometer.is_gesture('down'):
            if resend_down == 50:
                resend_down = 0
            if resend_down == 0:
                display.show('D')
                radio.send(RADIO_DOWN)
                reset_resend()
            resend_down += 1
        elif accelerometer.is_gesture('left'):
            if resend_left == 50:
                resend_left = 0
            if resend_left == 0:
                display.show('<')
                radio.send(RADIO_LEFT)
                reset_resend()
            resend_left += 1
        elif accelerometer.is_gesture('right'):
            if resend_right == 50:
                resend_right = 0
            if resend_right == 0:
                display.show('>')
                radio.send(RADIO_RIGHT)
                reset_resend()
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
    
if not button_a.is_pressed() and not button_b.is_pressed():
    gesture()
elif button_a.is_pressed() and not button_b.is_pressed():
    heading()
elif not button_a.is_pressed() and button_b.is_pressed():
    visitor_sense()
    
