import time
import board
import digitalio
import usb_hid
from gamepad import Gamepad

led = digitalio.DigitalInOut(board.LED)
led.direction = digitalio.Direction.OUTPUT

btn_up = 1
btn_down = 8

gp = Gamepad(usb_hid.devices)

while True:
    btn_down += 1
    if btn_down > 16:
        btn_down = 1
    btn_up += 1
    if btn_up > 16:
        btn_up = 1
    gp.press_buttons(btn_up)
    gp.release_buttons(btn_down)
    time.sleep(0.1)
    led.value = not led.value
