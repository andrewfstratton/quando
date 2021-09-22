# Access to micro:bit, currently for Windows
import serial.tools.list_ports
import serial, time, json, math
from threading import Thread

VID = 0x0D28
PID = 0x0204
SNOOZE = 0.02

_serial = False
io = False

class COMMS: # character
    BUTTON_A = 'a'
    BUTTON_B = 'b'
    FACE_UP = '^'
    FACE_DOWN = 'v'
    LEFT = '<'
    RIGHT = '>'
    UP = 'B'
    DOWN = 'F'

def _close():
    global _serial
    if _serial:
        try:
            _serial.close()
            print("ubit disconnected...")
        except:
            pass
    _serial = False

def get_ubit():
    global _serial
    if not _serial:
        ports = serial.tools.list_ports.comports()
        for port in ports:
            if (port.vid == VID) and (port.pid == PID):
                time.sleep(0.05) # wait for ubit to be ready
                try:
                    _serial = serial.Serial(port.device, 115200, timeout=0.05)
                    print("ubit Connected on", _serial.name)
                    break
                except serial.SerialException as ex:
                    print("ubit connection failed...")
                    # print(ex))
                    _close()
    return _serial

def get_ubit_line():
    result = ""
    try:
        if get_ubit():
            result = get_ubit().readline()
    except serial.SerialException as ex:
        print("ubit read exception")
        # print(ex)
        _close()
    return result


last_msg = ""
def handle_message(msg):
    global last_msg
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
    elif msg != '' and last_msg != msg: # check for encoded string
        last_msg = msg
        result = {}
        if COMMS.BUTTON_A in msg:
            result['button_a'] = True
        if COMMS.BUTTON_B in msg:
            result['button_b'] = True
        if '0' in msg :
            result['pin_0'] = True
        if '1' in msg :
            result['pin_1'] = True
        if '2' in msg :
            result['pin_2'] = True
        orientation =''
        if COMMS.FACE_UP in msg :
            orientation = 'up'
        elif COMMS.FACE_DOWN in msg :
            orientation = 'down'
        elif COMMS.LEFT in msg :
            orientation = 'left'
        elif COMMS.RIGHT in msg :
            orientation = 'right'
        elif COMMS.UP in msg :
            orientation = 'backward'
        elif COMMS.DOWN in msg :
            orientation = 'forward'
        result['orientation'] = orientation
    return result

def check_message():
    global io
    while True:
        line = get_ubit_line()
        # print(line)
        if line:
            msg = str(line,"utf-8")
            if msg != "":
                _out = handle_message(msg)
                if _out:
                    # print(line.rstrip(), ">>", _out)
                    io.emit("ubit", _out)
        else:
            time.sleep(SNOOZE)

def run(socket_io):
    global io
    io = socket_io
    Thread(target=check_message).start()

# Control below:

def send_message(message):
    ubit = get_ubit()
    if ubit:
        ubit.write((message+"\n").encode('utf-8'))
        ubit.flush()