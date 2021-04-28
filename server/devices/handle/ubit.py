# Access to micro:bit, currently for Windows
import serial.tools.list_ports
import serial, time, json
from threading import Thread

VID = 0x0D28
PID = 0x0204
PER_SECOND = 60
SNOOZE = 1.0/PER_SECOND

ubit_serial = False
io = False

def get_ubit():
    global ubit_serial
    result = False
    if not ubit_serial:
        ports = serial.tools.list_ports.comports()
        for port in ports:
            if (port.vid == VID) and (port.pid == PID):
                try:
                    ubit_serial = serial.Serial(port.device, 115200, timeout=1)
                    print("ubit Connected on", ubit_serial.name)
                    break
                except serial.SerialException:
                    # print("Dropped!", end="")
                    ubit_serial = False
    return ubit_serial


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
            # In case there is no valid data
    except json.JSONDecodeError:
        # Ignore random micro:bit corrupted data
        result = False
    return result

def check_message():
    global ubit_serial, io
    while True:
        sleep = True
        try:
            if not ubit_serial:
                get_ubit()
            if ubit_serial:
                line = ubit_serial.readline()
                # print(line)
                sleep = False
                msg = str(line,"utf-8")
                if msg != "":
                    _out = handle_message(msg)
                    if _out:
                        # print(line.rstrip(), ">>", _out)
                        io.emit("ubit", _out)
        except serial.SerialException:
            print("!")
            ubit_serial = False
        if sleep:
            time.sleep(SNOOZE)

def run(socket_io):
    global io
    io = socket_io
    print("start::ubit")
    Thread(target=check_message).start()
