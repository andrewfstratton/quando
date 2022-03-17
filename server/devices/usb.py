import serial.tools.list_ports
import serial, time

class Usb:
    def __init__(self, name, vid, pid):
        self.name = name
        self.vid = vid
        self.pid = pid
        self.serial = False

    def close(self):
        usb = self.get_serial()
        if usb:
            try:
                usb.close()
                print(self.name + " disconnected...")
            except:
                pass
        self.serial = False

    def get_serial(self):
        if not self.serial:
            ports = serial.tools.list_ports.comports()
            for port in ports:
                if (port.vid == self.vid) and (port.pid == self.pid):
                    time.sleep(0.05) # wait for device to be ready
                    try:
                        self.serial = serial.Serial(port.device, 115200, timeout=0.05)
                        print(self.name + " Connected on", self.serial.name)
                        break
                    except serial.SerialException as ex:
                        print(self.name + " connection failed...")
                        # print(ex)
                        self.close()
        return self.serial

    def get_line(self):
        result = ""
        try:
            usb = self.get_serial()
            if usb:
                result = usb.readline()
        except serial.SerialException as ex:
            print(self.name + " read exception")
            # print(ex)
            self.close()
        return result