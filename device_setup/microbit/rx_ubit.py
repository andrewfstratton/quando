import radio, math
from microbit import *

_channel = 0
CONFIG_FILE = 'config.txt'

# Radio won't work when off
def radio_on():
    # set the channel
    radio.config(channel=_channel, power=1, length=128, data_rate=radio.RATE_2MBIT)
    radio.on()

def display_channel():
    if _channel <= 9:
        display.show(str(_channel))
    else:
        display.show(chr(_channel-10+ord('A')))

def check_button(button, add):
    global _channel # allows change global var
    if button.is_pressed():
        _channel = _channel + add # which we do here
        if _channel < 0:
          _channel = 15
        elif _channel > 15:
            _channel = 0
        save()
        display_channel()
        while button.is_pressed():
            sleep(50) # 0.05secs

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
        print('{"message":"Init Channel"}')
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
                if sleeps == 500:
                    display.clear()
                sleeps += 1
            else:
                messages = incoming.split('\n')
                messages.pop() # drop the empty last one
                result = '{'
                for msg in messages:
                    parts = msg.split(':')
                    result += '"' + parts[1] + '":' + parts[2] + ','
                    display.show(parts[0])
                result = result[:-1] + '}' # replace the last , with }
                print(result)
                sleeps = 0
        except:
            print('{"error":"packet"}')
            radio.off()
            radio_on()
    return #never

print('{"started":true}')
load()
radio_on()
if button_a.is_pressed() and not button_b.is_pressed():
    config()
else:
    proxy()