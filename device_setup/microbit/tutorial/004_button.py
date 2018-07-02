from microbit import *

while True:
  while button_a.is_pressed():
    display.show("*")
  display.show("-")