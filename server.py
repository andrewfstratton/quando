# Installed: pip install flask pynput pySerial flask-socketio

from flask import Flask, request
from flask_socketio import SocketIO
from server.devices.control import mouse, keyboard
from server.devices.handle import ubit
import json, logging

app = Flask(__name__)
# app.config['SECRET_KEY'] = 'quando_secret'
socketio = SocketIO(app, cors_allowed_origins="*")

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

def _decode_json_data(req):
    str = req.data.decode('utf8')
    return json.loads(str)

@app.route('/')
def index():
    return 'Quando Python (local) server running...'

# REST modules

import server.rest.ip

@app.route('/control/mouse', methods=['POST'])
def mouse():
    mouse.handle(_decode_json_data(request))
    return ""

@app.route('/control/type', methods=['POST'])
def type():
    keyboard.type(_decode_json_data(request))
    return ""

if __name__ == '__main__':
    ubit.run(socketio)
    socketio.run(app)