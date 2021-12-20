from __main__ import app

from flask import jsonify, request
import server.common
from server.devices.maker_pi_rp2040 import send_message

@app.route('/maker_pi_rp2040/turn', methods=['POST'])
def maker_servo():
    data = server.common.decode_json_data(request)
    data = data['val']
    servo = data['servo']
    angle = data['angle']
    if servo > 0 and angle > 0:
        msg = "T=" + str(servo) + "," + str(angle)
        send_message(msg)
        # print("-"+msg)
    data = {"success":True}
    return jsonify(data)