from microbit import *

#also see http://microbit-micropython.readthedocs.io/en/latest/tutorials/images.html
while True:
  while button_a.is_pressed():
    display.show(Image.HAPPY)
  while button_b.is_pressed():
    display.show(Image.SAD)
  display.show(" ")