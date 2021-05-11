from __main__ import app

from flask import request
import server.common
from pynput import keyboard

@app.route('/control/type', methods=['POST'])
def type():
    data = server.common.decode_json_data(request)
    keyboard.Controller().type(data)
    return ""