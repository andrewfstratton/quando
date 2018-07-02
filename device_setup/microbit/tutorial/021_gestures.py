from microbit import *

# Detect and show gestures
counter = 0

def alarm():
  for x in range(100):
      display.show("!")
      pin0.write_digital(1)
      display.show(" ")
      pin0.write_digital(0)
    
def check_gesture(gesture, image):
  if accelerometer.was_gesture(gesture):
    display.show(image)
  sleep(100) # this is 0.1 seconds, or 100 milliseconds

display.show('?')
while True:
  check_gesture('face up', Image.RABBIT)
  check_gesture('face down', Image.COW)
  check_gesture('up', Image.GIRAFFE)
  check_gesture('down', Image.SNAKE)
  check_gesture('left', Image.DUCK)
  check_gesture('right', Image.TORTOISE)
