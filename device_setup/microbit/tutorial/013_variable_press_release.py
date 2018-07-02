from microbit import *

# Add in a wait until key is released before letting the user press it again

counter = 0

while True:
  while button_a.is_pressed():
    counter = counter - 1
    while button_a.is_pressed():
      pass # this means do nothing - like in mastermind
  while button_b.is_pressed():
    counter = counter + 1
    while button_b.is_pressed():
      pass
  display.show(str(counter))
