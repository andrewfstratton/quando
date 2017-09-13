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

ticks = 0
current_direction = 0 # i.e. no direction

FACE_UP = 1
FACE_DOWN = 2
UP = 3
DOWN = 4
LEFT = 5
RIGHT = 6

def inc_reset(direction, char, radio_message):
    global current_direction, ticks
    if current_direction != direction:
        current_direction == direction
        ticks = 0
    elif ticks == 50:
        ticks = 0
    if ticks == 0:
        display.show(char)
        radio.send(radio_message)
    ticks += 1
    sleep(20)
        
def gesture():
    while True:
        if accelerometer.is_gesture('face up'):
            inc_reset(FACE_UP, '^', RADIO_FACE_UP)
        elif accelerometer.is_gesture('face down'):
            inc_reset(FACE_DOWN, 'v', RADIO_FACE_DOWN)
        elif accelerometer.is_gesture('up'):
            inc_reset(UP, 'U', RADIO_UP)
        elif accelerometer.is_gesture('down'):
            inc_reset(DOWN, 'D', RADIO_DOWN)
        elif accelerometer.is_gesture('left'):
            inc_reset(LEFT, '<', RADIO_LEFT)
        elif accelerometer.is_gesture('right'):
            inc_reset(RIGHT, '>', RADIO_RIGHT)
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
elif not button_a.is_pressed() and button_b.is_pressed():
    visitor_sense()
    
