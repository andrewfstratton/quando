from microbit import *

# Tidy - press a or b should show the new counter immediately
counter = 0

display.show(str(counter))
while True:
  while button_a.is_pressed():
    counter = counter - 1
    display.show(str(counter))
    while button_a.is_pressed():
      pass
  while button_b.is_pressed():
    counter = counter + 1
    display.show(str(counter))
    while button_b.is_pressed():
      pass
