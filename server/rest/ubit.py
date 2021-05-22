from __main__ import app

from flask import jsonify, request
import server.common
from server.devices.ubit import send_message

@app.route('/ubit/display', methods=['POST'])
def ubit_display():
    data = server.common.decode_json_data(request)
    send_message("D=" + data['val'])
    data = {"success":True}
    return jsonify(data)

@app.route('/ubit/icon', methods=['POST'])
def ubit_icon():
    data = server.common.decode_json_data(request)
    val = data['val']
    if val.isdecimal() and int(val) > -1:
        send_message("I=" + val)
    data = {"success":True}
    return jsonify(data)

@app.route('/ubit/turn', methods=['POST'])
def ubit_servo():
    data = server.common.decode_json_data(request)
    data = data['val']
    servo = data['servo']
    angle = data['angle']
    if servo > -1 and angle > -1:
        send_message("T=" + str(servo) + "," + str(angle))
    data = {"success":True}
    return jsonify(data)