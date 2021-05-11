# Installed: pip install flask pynput pySerial flask-socketio

from flask import Flask, request
from flask_socketio import SocketIO
from server.devices.handle import ubit
import logging
import server.controlpanel
import multiprocessing
from server.db.common import set_path_for_db 

app = Flask(__name__)
set_path_for_db(app.root_path)
app.config['SECRET_KEY'] = 'quando_secret'
socketio = SocketIO(app, cors_allowed_origins="*", use_reloader=False)

@app.after_request
def add_header(response):
    # Appears necessary for Chrome
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, public, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    response.headers["Expires"] = "0"
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

@app.route('/')
def index():
    return 'Quando Python (local) server running...'

if __name__ == '__main__':

    # REST modules
    import server.rest.common
    import server.rest.ip
    import server.rest.client
    import server.rest.inventor
    import server.rest.blocks
    import server.rest.login
    import server.devices.control.keyboard
    import server.devices.control.mouse

    # Multi threading
    ubit.run(socketio)
    multiprocessing.Process(target=server.controlpanel.run).start()
    socketio.run(app)