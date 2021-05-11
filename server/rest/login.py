from __main__ import app

from flask import jsonify, request, session
import server.common
from server.db import user

@app.route('/login', methods=['GET'])
def login_get():
    if session.get('userid'):
        data = {"success":True, 'userid': session['userid']}
    else:
        data = {"success":False, 'message':'Not Logged In'}
    return jsonify(data)

@app.route('/login', methods=['POST'])
def login_post():
    data = server.common.decode_json_data(request)
    if user.get_on_id_password(data['userid'], data['password']):
        session['userid'] = data['userid']
        data = {"success":True}
    else:
        data = {"success":False, 'message':'Failure - user not found with password'}
    return jsonify(data)

@app.route('/login', methods=['DELETE'])
def login_delete():
    data = {"success":True, 'message': 'Logged Out'}
    if session.get('userid'):
        session.pop('userid')
    return jsonify(data)