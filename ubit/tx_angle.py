# Remote micro:bit - boot with 'a' button pressed for passive infrared, boot without for face up/down 
import radio, math
from microbit import *

# Common - easier this way due to simple build process
class COMMS: # character, json
    BUTTON_A = ('a', 'button_a:true\n')
    BUTTON_B = ('b', 'button_b:true\n')
    HEADING = 'H'
    ROLL_PITCH = 'R'
    TILT = 'T'

_channel = 0
CONFIG_FILE = 'config.txt'

# The radio won't work unless it's switched on.
def radio_on():
    print('{"channel":' + str(_channel) + '}')
    # set the channel
    radio.config(channel=_channel, power=1, length=128, data_rate=radio.RATE_2MBIT)
    radio.on()

def display_channel():
    if _channel <= 9:
        display.show(str(_channel))
    else:
        display.show(chr(_channel-10+ord('A')))

def check_button(button, add):
  global _channel # this allows us to change the global variable
  if button.is_pressed():
    _channel = _channel + add # which we do here
    if _channel < 0:
      _channel = 15
    elif _channel > 15:
      _channel = 0
    save()
    display_channel()
    sleep(500) # this is 0.5 seconds, or 500 millisecon

def config():
    display_channel()
    while True:
        check_button(button_a, -1)
        check_button(button_b, 1)

def save():
    with open(CONFIG_FILE, 'w') as file:
        file.write(str(_channel))
        
def load():
    global _channel
    try:
        with open(CONFIG_FILE, 'r') as file:
            data = file.read()
            _channel = int(data)
    except:
        print('{"Initialising":true}')
        save()
    display_channel()
    sleep(200)
    
def roll_pitch_heading():
    last_tilt = False
    last_roll = False
    last_pitch = False
    last_heading = False
    while True:
        if button_a.is_pressed() and button_b.is_pressed():
            compass.calibrate()
        elif button_a.was_pressed():
            radio.send(COMMS.BUTTON_A[0]+':'+COMMS.BUTTON_A[1])
        elif button_b.was_pressed():
            radio.send(COMMS.BUTTON_B[0]+':'+COMMS.BUTTON_B[1])
        heading = compass.heading()
        if (heading != last_heading) :
            radio.send(COMMS.HEADING+':heading:'+str(heading)+'\n')
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
#        strength = z/math.sqrt(x*x+y*y+z*z)
#        strength = max(-1, min(1, strength))
#        tilt = math.pi-math.acos(strength)
#        if tilt != last_tilt:
#            print(COMMS.TILT+':tilt:'+str(tilt)+' '+str(strength))
#            radio.send(COMMS.TILT+':tilt:'+str(tilt)+'\n')
#            sleep(20)
#            last_tilt = tilt
        if roll != last_roll or pitch != last_pitch:
            radio.send(COMMS.ROLL_PITCH+':roll_pitch:['+str(roll)+','+str(pitch)+']\n')
            last_roll = roll
            last_pitch = pitch
            display.show('+')
            sleep(20)
            display.show('-')
        sleep(20)
    return # never does
#Main program
print('{"started":true}')
load()
radio_on()
if button_a.is_pressed() and not button_b.is_pressed(): # only a pressed
    config()
else: 
    roll_pitch_heading()