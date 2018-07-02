from microbit import *

# Variables
counter = 0

while True:
  while button_a.is_pressed():
    counter = counter - 1
  while button_b.is_pressed():
    counter = counter + 1
  display.show(str(counter))
#  print(str(counter))
# The line above should help you discover what is happening
# ...the micro bit counts much faster than people can
  