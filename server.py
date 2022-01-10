# See install.bat for installed

from flask import Flask
from flask_socketio import SocketIO
import logging
import server.controlpanel
import multiprocessing
from server.db import db 
import socket, sys

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

def check_port(port):
    """ True -- it's possible to listen on this port for TCP/IPv4
    False -- otherwise.
    """
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.bind(('127.0.0.1', port))
        sock.listen(5)
        sock.close()
    except socket.error:
        return False
    return True

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

if __name__ == '__main__':

    # REST modules
    import server.rest.dashboard
    import server.rest.common
    import server.rest.ip
    import server.rest.client
    import server.rest.editor
    import server.rest.user
    import server.rest.script
    import server.rest.file
    import server.rest.message

    # Devices
    try:
        import server.devices.control.keyboard
    except ImportError:
        print("Running without (local) keyboard control")
    try:
        import server.devices.control.mouse
    except ImportError:
        print("Running without (local) mouse control")

    # Setup
    server.rest.message.set_io(socketio)

    # Multi threading
    try:
        from server.devices import ubit
        import server.rest.ubit
        ubit.run()
    except ImportError:
        print("Running without micro:bit")
    try:
        from server.devices import maker_pi_rp2040
        import server.rest.maker_pi_rp2040
        maker_pi_rp2040.run()
    except ImportError:
        print("Running without Maker Pi RP2040")
    multiprocessing.Process(target=server.controlpanel.run).start()

    # Check for ports and serve
    ports = [80, 4567, 0]
    for port in ports:
        if check_port(port):
            print("Quando server running on port: %i" % port)
            socketio.run(app, host='0.0.0.0', port=port)
            sys.exit()