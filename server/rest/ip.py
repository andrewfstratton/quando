from __main__ import app

from flask import jsonify
import socket

@app.route('/ip')
def ip():
    _ip ="127.0.0.1"
    # See https://stackoverflow.com/questions/166506/finding-local-ip-addresses-using-pythons-stdlib
    try:
        _socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        _socket.connect(("10.255.255.255", 1))
        _ip = _socket.getsockname()[0]
    finally:
        _socket.close()
    data = {"ip": _ip, "local":True, "success":True}
    return jsonify(data)