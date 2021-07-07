import math
from microbit import *

# N.B. Must flash with https://python.microbit.org/v/1.1 to get a working version
# or else micro:bit will hang

class Servo:

    """
    A simple class for controlling hobby servos.
    Args:
        pin (pin0 .. pin3): The pin where servo is connected.
        freq (int): The frequency of the signal, in hertz.
        min_us (int): The minimum signal length supported by the servo.
        max_us (int): The maximum signal length supported by the servo.
        angle (int): The angle between minimum and maximum positions.
    Usage:
        SG90 @ 3.3v servo connected to pin0
        = Servo(pin0).write_angle(90)
    """

    def __init__(self, pin, freq=50, min_us=600, max_us=2300, angle=180):
        self.min_us = min_us
        self.max_us = max_us
        self.us = 0
        self.freq = freq
        self.angle = angle
        self.analog_period = 0
        self.pin = pin
        analog_period = round((1 / self.freq) * 1000)  # hertz to miliseconds
        self.pin.set_analog_period(analog_period)

    def write_us(self, us):
        us = min(self.max_us, max(self.min_us, us))
        duty = round(us * 1024 * self.freq // 1000000)
#        print('{"message":"duty=' + str(duty) + '"}')
        self.pin.write_analog(duty)

    #        sleep(50)
    #        self.pin.write_digital(0)  # turn the pin off

    def write_angle(self, degrees=None):
        degrees = degrees % 360
        total_range = self.max_us - self.min_us
        us = self.min_us + total_range * degrees // self.angle
        self.write_us(us)


def go():
    pins = [pin0, pin1, pin2]
    icons = [Image.HAPPY, Image.SAD, Image.YES, Image.NO, Image.HEART, Image.HEART_SMALL]
    val = ''
    while True:
        try:
            b = uart.read(1)
            if b != None:
                ch = str(b, 'UTF-8')
                if ch != '\n':
                    val += ch
                else:
                    eq = val.find("=")
                    key = val[:eq]
                    val = val[eq + 1 :]
                    if key == "D":
                        display.scroll(val, wait=False)
                    elif key == "I":
                        val = int(val)
                        if val == 0:
                            display.show(' ')
                        else:
                            display.show(icons[val-1])
                    elif key == "T":
                        comma = val.find(",")
                        angle = int(val[:comma])
                        servo = int(val[comma + 1 :])
                        # angle has had 360 added, so 0 is an error
                        if angle > 0 and servo > 0:
                            Servo(pins[servo - 1]).write_angle(angle-360)
                    val =''
        except Exception as ex:
            print('{"message":"Exception:' + str(ex) + '"}')
    # Never finish...


uart.init(115200,8,None,1)
print('{"started":true}')
image = Image("88000:80808:80800:80808:88000")
display.show(image)
sleep(750)
display.clear()
go()
