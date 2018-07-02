from microbit import *

# Add in a common function to reduce duplication
# this is a different kind of tidying - called refactoring
counter = 0
    
def check_button(button, add):
  global counter # this allows us to change the global variable
  if button.is_pressed():
    counter = counter + add # which we do here
    if counter < 0:
      counter = 0
    elif counter > 9:
      counter = 9
    display.show(str(counter))
    sleep(500) # this is 0.5 seconds, or 500 milliseconds

display.show(str(counter))
while True:
  check_button(button_a, -1)
  check_button(button_b, 1)
