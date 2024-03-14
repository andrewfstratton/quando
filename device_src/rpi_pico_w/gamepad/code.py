import time
import board
import digitalio
import usb_hid
from gamepad import Gamepad

led = digitalio.DigitalInOut(board.LED)
led.direction = digitalio.Direction.OUTPUT

btn = 1

print("Started!!")
state = True
led.value = state
try:
    gp = Gamepad(usb_hid.devices)
except NameError:
    state = False

while True:
    led.value = state
    led.value = True
    gp.press_buttons(btn)
    time.sleep(0.7)
    led.value = not state
    gp.release_buttons(btn)
    time.sleep(0.15)
