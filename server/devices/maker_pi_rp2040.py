# Access to Maker Pi RP2040, currently for Windows
from server.devices.usb import Usb
# import time, json, math, requests
from threading import Thread

_VID = 0x2E8A # 11914 
_PID = 0x1000 # 4096
_pico = Usb("Maker Pi RP2040", _VID, _PID)

def check_message():
    while True:
        line = _pico.get_line()
        if line:
            pass
            # print(line)
          

def run():
    Thread(target=check_message).start()

# Control below:

def send_message(message):
    _pico.send_message(message)