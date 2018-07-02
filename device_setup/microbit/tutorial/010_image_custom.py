from microbit import *

# Create a new image - use 0 for pixel off and 9 for pixel on
# Don't forget the : at the end of the first 4 lines (not the last line)

face = Image(
  "00000:"
  "09090:"
  "00000:"
  "09990:"
  "00000")

while True:
  while button_a.is_pressed():
    display.show(Image.HAPPY)
  while button_b.is_pressed():
    display.show(Image.SAD)
  display.show(face)
  
# Extra - Create your own 5 by 5 pixel pictures