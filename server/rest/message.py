from __main__ import app

from flask import jsonify, request
from flask_socketio import emit
import server.common
import urllib

io = False

@app.route('/message/<id>', methods=['POST'])
def message_post(id):
    data = server.common.decode_json_data(request)
    val = data['val']
    host = data['host']
    if host:
        print("Warning - host ignored:" + host)
    local = data['local']
    socket_id = data['socketId']
#     if host:
#         new_req = urllib.request.Request("http://" + host,
#             request.data, request.headers)
#         response = urllib.request.urlopen(new_req)
#         print(response)
# # emit('my response', json, namespace='/chat')
#     else:
    data = {"val": val, "local": local}
    if local and socket_id:
        io.emit(id, data, to=socket_id)
    else:
        io.emit(id, data)
    return jsonify({})

def set_io(_io):
    global io
    io = _io