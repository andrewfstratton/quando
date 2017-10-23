import radio, math
from microbit import *

class COMMS:
    IR = ('I', Image.HEART, '{"ir":true}')
    BUTTON_A = ('a', 'a', '{"button":"a"}')
    BUTTON_B = ('b', 'b', '{"button":"b"}')
    FACE_UP = ('U', '^', '{"orientation":"up"}')
    FACE_DOWN = ('D', 'v', '{"orientation":"down"}')
    LEFT = ('L', '<', '{"orientation":"left"}')
    RIGHT = ('R', '>', '{"orientation":"right"}')
    UP = ('B', 'B', '{"orientation":"backward"}')
    DOWN = ('F', 'F', '{"orientation":"forward"}')
    HEADING = 'H'
    ROLL = 'R'
    arr = [IR, BUTTON_A, BUTTON_B, FACE_UP, FACE_DOWN, LEFT, RIGHT, UP, DOWN]
    @classmethod
    def forward(cls, incoming):
        for i in cls.arr:
            if i[0] == incoming:
                display.show(i[1])
                print(i[2])
                break

_channel = 0
CONFIG_FILE = 'config.txt'

# The radio won't work unless it's switched on.
def radio_on():
    radio.config(channel=_channel) # set the channel
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
        while button.is_pressed():
            sleep(50) # this is 0.05 seconds, or 500 millisecon

def config():
    flip = 0
    animation = ['-','+']
    while button_a.is_pressed() and button_b.is_pressed():
        display.show(animation[flip])
        sleep(250)
        flip = 1 - flip
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
        print('{"message":"Initialising Channel"}')
        save()
    display_channel()
    sleep(200)

# Event loop.
def proxy():
    sleeps = 0
    while True:
        try:
            incoming = radio.receive()
            if incoming == None:
                if sleeps == 50:
                    display.clear()
                else:
                    sleep(10)                        
                sleeps += 1
            else:
                sleeps = 0
                COMMS.forward(incoming)
                heading = incoming.find(COMMS.HEADING)
                if (heading >= 0):
                    heading = incoming[1:]
                    print('{"heading":'+heading+'}')
                    heading = int(heading)
                    needle = ((15 - heading)//30)%12
                    display.show(Image.ALL_CLOCKS[needle])
#                roll = incoming.find(COMMS.ROLL)
#                if (roll >= 0):
#                    roll = incoming[1:]
#                    print('{"roll":'+roll+'}')
            sleep(20)
        except:
            print('{"error":"packet"}')
            radio.off()
            sleep(1000)
            radio_on()
    return # never

def roll_pitch():
    last_roll = False
    last_pitch = False
    while True:
        x = accelerometer.get_x()/1024
        y = accelerometer.get_y()/1024
        z = accelerometer.get_z()/1024
        roll = math.pi-(math.atan2(x, z)%(math.pi*2))
        pitch = math.pi-(math.atan2(y, z)%(math.pi*2))
#        if button_b.is_pressed():
#            print('{roll:'+str(roll)+', pitch:'+str(pitch)+'}')
#            sleep(200)
        if roll != last_roll or pitch != last_pitch:
            print('{roll:'+str(roll)+',pitch:'+str(pitch)+'}')
            last_roll = roll
            last_pitch = pitch
            display.show('+')
            sleep(20)
            display.show('-')
        sleep(20)
    return # never does
    
print('{"started":true}')
load()
radio_on()
if button_a.is_pressed() and button_b.is_pressed():
    config()
elif button_b.is_pressed():
    roll_pitch()
else:
    proxy()
