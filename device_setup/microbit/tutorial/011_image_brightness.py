from microbit import *

# Brightness of a pixel can be 0-off to 9-fully on

face = Image(
  "00000:"
  "05050:"
  "00000:"
  "05550:"
  "00000")

while True:
  while button_a.is_pressed():
    display.show(Image.HAPPY)
  while button_b.is_pressed():
    display.show(Image.SAD)
  display.show(face)
  
# Extra - Create your own multi brightness pictures