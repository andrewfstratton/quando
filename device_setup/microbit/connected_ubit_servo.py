import math
from microbit import *

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
        analog_period = round((1/self.freq) * 1000)  # hertz to miliseconds
        self.pin.set_analog_period(analog_period)

    def write_us(self, us):
        us = min(self.max_us, max(self.min_us, us))
        duty = round(us * 1024 * self.freq // 1000000)
        print('{"message":"duty='+str(duty)+'"}')
        self.pin.write_analog(duty)
#        sleep(50)
#        self.pin.write_digital(0)  # turn the pin off

    def write_angle(self, degrees=None):
        degrees = degrees % 360
        total_range = self.max_us - self.min_us
        us = self.min_us + total_range * degrees // self.angle
        self.write_us(us)

def go():
    print('{"msg":"started"}')
    pins = [pin0, pin1, pin2]
    icons = [Image.HAPPY, Image.SAD]
    while True:
        if uart.any():
            try:
                x = str(uart.readline(), 'utf-8')[:-1]
                eq = x.find('=')
                key = x[:eq]
                val = x[eq+1:]
                if key == 'D':
                    display.scroll(val, wait=False)
                elif key == 'I':
                    display.show(icons[int(val)])
                elif key == 'T':
                    comma = val.find(',')
                    angle = int(val[:comma])
                    servo = int(val[comma+1:])
                    if angle > 0 and servo > 0:
                        Servo(pins[servo-1]).write_angle(angle-1)
            except Exception as ex:
                print('{"message":"Exception:'+str(ex)+'"}')
    #Never finish...

go()