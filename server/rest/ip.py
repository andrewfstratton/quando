from __main__ import app

from flask import jsonify
import socket

@app.route('/ip')
def ip():
    data = {"ip": socket.gethostbyname(socket.gethostname()),
        "local":True, "success":True}
    return jsonify(data)