import math

from microbit import *

def roll_pitch_heading():
    last_msg = ""
    resend_count = 0
    last_json_msg = ""
    dot = Image("00000:00000:00800:00000:00000")
    last_roll = False
    last_pitch = False
    cycle = 0
    while True:
        msg = ""
        if button_a.is_pressed():
            msg += 'a'
        if button_b.is_pressed():
            msg += 'b'

        resend_count += 1
        if msg == last_msg: # sends empty message when all buttons are released
            if resend_count >= 20: # i.e. 1 second resend when same
                if msg != "":
                    print(msg)
                resend_count = 0
        else: # Different message
            print(msg)
            resend_count = 0
        last_msg = msg

        json_msg = ""
        x = accelerometer.get_x()/1024
        y = accelerometer.get_y()/1024
        z = accelerometer.get_z()/1024
        roll = math.pi-(math.atan2(x, z)%(math.pi*2))
        pitch = math.pi-(math.atan2(y, z)%(math.pi*2))
        if roll != last_roll:
            last_roll = roll
            json_msg = '"Ro":'+str(roll)
        if pitch != last_pitch:
            last_pitch = pitch
            if json_msg != "":
                json_msg += ','
            json_msg += '"Pi":'+str(pitch)
        if json_msg != "" and (json_msg != last_json_msg):
            print('{'+json_msg+'}')
        last_json_msg = json_msg

        cycle += 1
        if cycle > 20:
            display.show(dot)
            cycle = 0
        elif cycle == 1:
            display.show(' ')
        sleep(50)
    return # never does

# Main program
uart.init(115200,8,None,1)
print('{"started":true}')
image = Image("00008:00080:00800:08000:88888")
display.show(image)
sleep(750)
roll_pitch_heading()
