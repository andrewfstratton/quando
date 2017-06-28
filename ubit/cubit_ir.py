import radio
from microbit import *

RADIO_IR = 'I'
RADIO_BUTTON_A = 'A'
RADIO_BUTTON_B = 'B'
RADIO_FACE_UP = 'U'
RADIO_FACE_DOWN = 'D'
RADIO_LEFT = 'L'
RADIO_RIGHT = 'R'
RADIO_HEADING = 'H'

def test():
    print("Started test")
    while True:
        str = radio.receive()
        if (str is not None):
            print("recd:%s" % str)

def direction():
    while True:
        print('{"heading":' + str(compass.heading()) + '}')
        sleep(100)
    return # never

# Event loop.
def proxy():
    sleeps = 0
    while True:
        try:
            incoming = radio.receive()
            if incoming == None:
                if sleeps == 50:
                    display.clear()
                sleeps += 1
                sleep(10)
            else:
                sleeps = 0
                if incoming == RADIO_IR:
                    display.show(Image.HEART, delay=0, wait=False)
                    print('{"ir":true}')
                if incoming == RADIO_BUTTON_A:
                    display.show('a')
                    print('{"button":"a"}')
                if incoming == RADIO_BUTTON_B:
                    display.show('b')
                    print('{"button":"b"}')
                if incoming == RADIO_FACE_UP:
                    display.show('^')
                    print('{"orientation":"up"}')
                if incoming == RADIO_FACE_DOWN:
                    display.show('v')
                    print('{"orientation":"down"}')
                if incoming == RADIO_LEFT:
                    display.show('<')
                    print('{"orientation":"left"}')
                if incoming == RADIO_RIGHT:
                    display.show('>')
                    print('{"orientation":"right"}')
                heading = incoming.find(RADIO_HEADING)
                if (heading >= 0):
                    heading = incoming[1:]
                    display.show('*')
                    print('{"heading":'+heading+'}')
        except:
            print('{"error":"packet"}')
            radio.off()
            radio.on()
    return # never

# The radio won't work unless it's switched on.
radio.on()
print('{"started":true}')
if button_a.is_pressed():
    direction()
elif button_b.is_pressed():
    test()
else:
    proxy()
