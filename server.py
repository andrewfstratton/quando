# See install.bat for installed

from flask import Flask, request
from flask_socketio import SocketIO
from server.devices import ubit
import logging
import server.controlpanel
import multiprocessing
from server.db import db 

app = Flask(__name__)
db.set_path_for_db(app.root_path)
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

if __name__ == '__main__':

    # REST modules
    import server.rest.dashboard
    import server.rest.common
    import server.rest.ip
    import server.rest.client
    import server.rest.inventor
    import server.rest.blocks
    import server.rest.login
    import server.rest.user
    import server.rest.script
    import server.rest.file
    import server.rest.message
    import server.rest.ubit

    # Devices
    import server.devices.control.keyboard
    import server.devices.control.mouse

    # Setup
    server.rest.message.set_io(socketio)

    # Multi threading
    ubit.run(socketio)
    multiprocessing.Process(target=server.controlpanel.run).start()
    socketio.run(app, host='0.0.0.0', port=80)