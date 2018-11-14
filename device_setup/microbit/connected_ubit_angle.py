import math
from microbit import *

class COMMS: # character, json
    HEADING = 'H'
    ROLL_PITCH = 'R'
    BUTTON_A = ('a', '{"button_a":true}')
    BUTTON_B = ('b', '{"button_b":true}')

def roll_pitch_heading():
    last_tilt = False
    last_roll = False
    last_pitch = False
    last_heading = False
    while True:
        if button_a.is_pressed() and button_b.is_pressed():
            compass.calibrate()
        elif button_a.was_pressed():
            print(COMMS.BUTTON_A[1])
        elif button_b.was_pressed():
            print(COMMS.BUTTON_B[1])
        heading = compass.heading()
        if (heading != last_heading) :
            print('{"heading":'+str(heading)+'}')
            sleep(20)
            last_heading = heading
            needle = ((15 - heading)//30)%12
            display.show(Image.ALL_CLOCKS[needle])
        display.show(' ')
        x = accelerometer.get_x()/1024
        y = accelerometer.get_y()/1024
        z = accelerometer.get_z()/1024
        roll = math.pi-(math.atan2(x, z)%(math.pi*2))
        pitch = math.pi-(math.atan2(y, z)%(math.pi*2))
        if roll != last_roll or pitch != last_pitch:
            print('{"roll_pitch":['+str(roll)+','+str(pitch)+']}')
            last_roll = roll
            last_pitch = pitch
            display.show('+')
            sleep(10)
            display.show('-')
        sleep(20)
    return # never does
#Main program
print('{"started":true}')
image = Image("00008:00080:00800:08000:88888")
display.show(image)
sleep(750)
roll_pitch_heading()