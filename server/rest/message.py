from __main__ import app

from flask import jsonify, request
from flask_socketio import emit
import server.common

io = False

@app.route('/message/<id>', methods=['POST'])
def message_post(id):
    data = server.common.decode_json_data(request)
    val = data['val']
    host = data['host']
    local = data['local']
    socket_id = data['socketId']
    if host:
        print(id, val, host, local, socket_id)
# emit('my response', json, namespace='/chat')
    else:
        data = {"val": val, "local": local}
        if local and socket_id:
            io.emit(id, data, to=socket_id)
        else:
            io.emit(id, data)
    return jsonify({})

def set_io(_io):
    global io
    io = _io