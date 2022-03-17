# Access to micro:bit, currently for Windows
from server.devices.usb import Usb
import time, json, math, requests
from threading import Thread

_VID = 0x0D28
_PID = 0x0204
_SNOOZE = 0.02
_last_msg = ""
_ubit = Usb("ubit", _VID, _PID)

BUTTON_A = 'a'
BUTTON_B = 'b'
FACE_UP = '^'
FACE_DOWN = 'v'
LEFT = '<'
RIGHT = '>'
UP = 'B'
DOWN = 'F'

def handle_message(msg):
    global _last_msg
    # returns true dictionary result if anything to send
    result = False
    data = False
    try:
        data = json.loads(msg)
    except json.JSONDecodeError:
        data = False
    if type(data) is dict:
        # print("json : " + msg)
        result = {}
        roll = data.get("Ro", False)
        if roll:
            result['roll'] = math.degrees(roll)
        pitch = data.get("Pi", False)
        if pitch:
            result['pitch'] = math.degrees(pitch)
    elif msg != '' and _last_msg != msg: # check for encoded string
        _last_msg = msg
        result = {}
        if BUTTON_A in msg:
            result['button_a'] = True
        if BUTTON_B in msg:
            result['button_b'] = True
        if '0' in msg :
            result['pin_0'] = True
        if '1' in msg :
            result['pin_1'] = True
        if '2' in msg :
            result['pin_2'] = True
        orientation =''
        if FACE_UP in msg :
            orientation = 'up'
        elif FACE_DOWN in msg :
            orientation = 'down'
        elif LEFT in msg :
            orientation = 'left'
        elif RIGHT in msg :
            orientation = 'right'
        elif UP in msg :
            orientation = 'backward'
        elif DOWN in msg :
            orientation = 'forward'
        result['orientation'] = orientation
    return result

def check_message():
    while True:
        line = _ubit.get_line()
        # print(line)
        if line:
            msg = str(line,"utf-8")
            if msg != "":
                _out = handle_message(msg)
                if _out:
                    # print(line.rstrip(), ">>", _out)
                    resp = requests.post('http://127.0.0.1/device/ubit', json = _out)
                    # print(resp.status_code)
        else:
            time.sleep(_SNOOZE)

def run():
    Thread(target=check_message).start()
