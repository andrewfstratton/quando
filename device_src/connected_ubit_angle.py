import math
from microbit import *

BUTTON_A = '{"Ba":true}'
BUTTON_B = '{"Bb":true}'

def roll_pitch_heading():
    dot = Image("00000:00000:00800:00000:00000")
    last_roll = False
    last_pitch = False
    cycle = 0
    while True:
        if button_a.was_pressed():
            print(BUTTON_A)
        if button_b.was_pressed():
            print(BUTTON_B)
        display.show(' ')
        x = accelerometer.get_x()/1024
        y = accelerometer.get_y()/1024
        z = accelerometer.get_z()/1024
        roll = math.pi-(math.atan2(x, z)%(math.pi*2))
        pitch = math.pi-(math.atan2(y, z)%(math.pi*2))
        if roll != last_roll or pitch != last_pitch:
            if roll != last_roll:
                print('{"Ro":'+str(roll)+'}') # sent as radians
            if pitch != last_pitch:
                print('{"Pi":'+str(pitch)+'}') # sent as radians
            last_pitch = pitch
            last_roll = roll
        cycle += 1
        if cycle > 20:
            display.show(dot)
            cycle = 0
        sleep(50)
    return # never does
#Main program
print('{"started":true}')
image = Image("00008:00080:00800:08000:88888")
display.show(image)
sleep(750)
roll_pitch_heading()
