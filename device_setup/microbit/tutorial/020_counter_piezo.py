from microbit import *

# Sound an 'Alarm'  which uses a piezo electric 'buzzer'
# Using a common function - called by the existing function
counter = 0

def alarm():
  for x in range(100):
      display.show("!")
      pin0.write_digital(1)
      display.show(" ")
      pin0.write_digital(0)
    
def check_button(button, add):
  global counter # this allows us to change the global variable
  if button.is_pressed():
    counter = counter + add # which we do here
    if counter < 0:
      counter = 0
      alarm()
    elif counter > 9:
      counter = 9
      alarm()
    display.show(str(counter))
    sleep(500) # this is 0.5 seconds, or 500 milliseconds

display.show(str(counter))
while True:
  check_button(button_a, -1)
  check_button(button_b, 1)
