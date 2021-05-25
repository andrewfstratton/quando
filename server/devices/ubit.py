# Access to micro:bit, currently for Windows
import serial.tools.list_ports
import serial, time, json, math
from threading import Thread

VID = 0x0D28
PID = 0x0204
SNOOZE = 0.02

_serial = False
io = False

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
                    # print(ex)
                    _close()
    return _serial

def get_ubit_line():
    result = ""
    try:
        if get_ubit():
            result = get_ubit().readline()
    except serial.SerialException as ex:
        print("ubit read exception")
        print(ex)
        _close()
    return result


def handle_message(json_in):
    # returns true dictionary result if anything to send
    result = False
    try:
        # print(json_in)
        # in case corruption results in a valid other type?!
        data = json.loads(json_in)
        if not type(data) is dict:
            print("~")
        else:
            btn_a = data.get("Ba", False)
            btn_b = data.get("Bb", False)
            result = {}
            if btn_a and btn_b:
                result['button_ab'] = True
            elif btn_a:
                result['button_a'] = True
            elif btn_b:
                result['button_b'] = True
            orientation = data.get("Or", False)
            if orientation:
                result['orientation'] = orientation
            roll = data.get("Ro", False)
            if roll:
                result['roll'] = math.degrees(roll)
            pitch = data.get("Pi", False)
            if pitch:
                result['pitch'] = math.degrees(pitch)
            pin0 = data.get("P0", False)
            pin1 = data.get("P1", False)
            pin2 = data.get("P2", False)
            if pin0:
                result['pin_0'] = True
            if pin1:
                result['pin_1'] = True
            if pin2:
                result['pin_2'] = True
            # In case there is corrupt data
    except json.JSONDecodeError:
        print("ubit ignoring" + json_in)
        # Ignore random micro:bit corrupted data
        result = False
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