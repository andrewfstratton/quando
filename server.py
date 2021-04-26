# Installed: pip install flask pynput pySerial

from flask import Flask, request
from server.control.mouse import handle as mouse_handle
import json

app = Flask(__name__)

@app.route('/')
def index():
    return 'Quando Python (local) running...'

@app.route('/control/mouse', methods=['POST'])
def mouse():
    str = request.data.decode('utf8')
    data = json.loads(str)
    print(data)
    mouse_handle(data)
    return ""

if __name__ == '__main__':
    app.run()