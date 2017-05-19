import radio
from microbit import *

def direction():
    while True:
        print('{"heading":' + str(compass.heading()) + '}')
        sleep(100)
    return # never

# Event loop.
def proxy():
    while True:
        sleep_ms = 20
        incoming = radio.receive()
        if incoming == 'ir':
            display.show(Image.HEART, delay=0, wait=False)
            print('{"ir":true}')
            sleep_ms = 500
        if incoming == 'button_a':
            display.show('a')
            print('{"button":"a"}')
            sleep_ms = 500
        if incoming == 'button_b':
            display.show('b')
            print('{"button":"b"}')
            sleep_ms = 500
        if incoming == 'face_up':
            display.show('^')
            print('{"orientation":"up"}')
        if incoming == 'face_down':
            display.show('v')
            print('{"orientation":"down"}')
        sleep(sleep_ms)
        display.clear()
    return # never

# The radio won't work unless it's switched on.
radio.on()
print('{"started":true}')
if button_a.is_pressed():
    direction()
else:
    proxy()
