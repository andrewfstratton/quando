import radio
from microbit import *

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
    def forward(incoming, match, image, message):
        if incoming == match:
            display.show(image)
            print(message)
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
                forward(incoming, RADIO_IR, Image.HEART, '{"ir":true}')
                forward(incoming, RADIO_BUTTON_A, 'a', '{"button":"a"}')
                forward(incoming, RADIO_BUTTON_B, 'b', '{"button":"b"}')
                forward(incoming, RADIO_FACE_UP, Image.HAPPY, '{"orientation":"up"}')
                forward(incoming, RADIO_FACE_DOWN, Image.SAD, '{"orientation":"down"}')
                forward(incoming, RADIO_LEFT, '>', '{"orientation":"left"}')
                forward(incoming, RADIO_RIGHT, '<', '{"orientation":"right"}')
                forward(incoming, RADIO_UP, '^', '{"orientation":"forward"}')
                forward(incoming, RADIO_DOWN, 'v', '{"orientation":"backward"}')
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
