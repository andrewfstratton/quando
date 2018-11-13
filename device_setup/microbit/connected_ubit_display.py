import math
from microbit import *

while True:
    x = input() # doesn't work!
    display.scroll(x, wait=False, loop=True)
