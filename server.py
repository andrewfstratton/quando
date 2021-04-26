# Installed: pip install flask pynput pySerial

from flask import Flask, request
from server.control import mouse, keyboard
import json

app = Flask(__name__)

@app.route('/')
def index():
    return 'Quando Python (local) running...'

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
    app.run()