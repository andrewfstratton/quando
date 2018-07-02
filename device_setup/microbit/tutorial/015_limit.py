from microbit import *

# Tidy - limit the counter to being between 0 and 9
counter = 0

display.show(str(counter))
while True:
  while button_a.is_pressed():
    if counter > 0:
      counter = counter - 1
      display.show(str(counter))
      while button_a.is_pressed():
        pass
  while button_b.is_pressed():
    if counter < 9:
      counter = counter + 1
      display.show(str(counter))
      while button_b.is_pressed():
        pass
