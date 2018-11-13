import math
from microbit import *

while True:
    if uart.any():
        x = str(uart.readline(), 'utf-8')[:-1]
        eq = x.find('=')
        key = x[:eq]
        val = x[eq+1:]
        if key == 'display':
            display.scroll(val, wait=False)
        elif key == 'icon':
            icon = Image.CONFUSED
            if val == 'happy':
                icon = Image.HAPPY
            elif val == 'sad':
                icon = Image.SAD
            display.show(icon)
#Never finish...