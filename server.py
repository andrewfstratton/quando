# Installed: pip install flask pynput pySerial flask-socketio

from flask import Flask, request
from flask_socketio import SocketIO
from server.control import mouse, keyboard
from server.handle import ubit
import json
import logging

app = Flask(__name__)
# app.config['SECRET_KEY'] = 'quando_secret'
socketio = SocketIO(app, cors_allowed_origins="*")

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

@app.route('/')
def index():
    return 'Quando Python (local) server running...'

@app.route('/control/mouse', methods=['POST'])
def mouse():
    str = request.data.decode('utf8')
    data = json.loads(str)
    mouse.handle(data)
    return ""

@app.route('/control/type', methods=['POST'])
def type():
    str = request.data.decode('utf8')
    data = json.loads(str)
    keyboard.type(data)
    return ""

if __name__ == '__main__':
    ubit.run(socketio)
    socketio.run(app)