from microbit import *

# Change to have a delay after pressing a button
counter = 0

display.show(str(counter))
while True:
  if button_a.is_pressed(): # no longer needs to be while
    if counter > 0:
      counter = counter - 1
      display.show(str(counter))
      sleep(0.5*1000) # this is 0.5 seconds, or 500 milliseconds
  if button_b.is_pressed():
    if counter < 9:
      counter = counter + 1
      display.show(str(counter))
      sleep(0.5*1000)
