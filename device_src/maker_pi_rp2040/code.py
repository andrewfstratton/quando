import board, pwmio
from adafruit_motor import servo

# Initialize servos
# 50% duty cycle: 2**15 = 32768 = 1/2 of 65536 (16-bit)
servo_motors = []  # create an array and add servo objects.
servo_motors.append(servo.Servo(pwmio.PWMOut(board.GP12, duty_cycle=2**15, frequency=50)))
servo_motors.append(servo.Servo(pwmio.PWMOut(board.GP13, duty_cycle=2**15, frequency=50)))
servo_motors.append(servo.Servo(pwmio.PWMOut(board.GP14, duty_cycle=2**15, frequency=50)))
servo_motors.append(servo.Servo(pwmio.PWMOut(board.GP15, duty_cycle=2**15, frequency=50)))

# print("Started...")
while True:
    inp = input()
    eq = inp.find("=")
    key = inp[:eq]
    data = inp[eq+1:]
    if key == "T":
        comma = data.find(",")
        servo = data[:comma]
        angle = data[comma + 1 :]
        try:
            servo = int(servo)
            angle = int(angle)
            if angle>0 and servo >0:
                # angle needs translating from 360-90..360+90 to 180..0
                angle -= (360-90)
                angle = 180 - angle
                servo -= 1 # number on board starts at 0
#                print(servo,":",angle)
                servo_motors[servo].angle = angle
        except:
            pass
