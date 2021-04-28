from pynput import keyboard

def type(data):
    keyboard.Controller().type(data)
