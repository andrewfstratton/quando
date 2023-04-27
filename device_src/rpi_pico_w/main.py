from machine import Pin
import time

led = Pin("LED", Pin.OUT)

print("Started...")
while True:
    inp = input()
    eq = inp.find("=")
    key = inp[:eq]
    data = inp[eq+1:]
    if key == "L": # switch an led on/off
        try:
            state = int(data) # data is '0' or '1'
#            print(state)
            led.value(state)
        except:
            pass
#    print(inp)

