from __main__ import app

from flask import jsonify, request
from flask_socketio import emit

_io = False

@app.route('/device/<id>', methods=['POST'])
def device_post(id): # used to push state changes to local devices
    data = server.common.decode_json_data(request)
    id = "!"+id # prefix with ! for special (internal) messages
    _io.emit(id, data)
    return jsonify({})