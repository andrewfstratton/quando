from __main__ import app

from flask import jsonify, request
import server.common
from server.db import user

@app.route('/user', methods=['POST'])
def user_post():
    data = server.common.decode_json_data(request)
    userid = data['userid']
    password = data['password']
    # N.B. Sqlite3 NOT NULL doesn't work with PRIMARY or UNIQUE
    if userid == "" or password == "":
        data = {"success":False, 'message':'Failure - empty userid or password'}
    else:
        try:
            if user.create(data['userid'], data['password']):
                data = {"success":True}
            else:
                data = {"success":False, 'message':'Failure - invalid user details'}
        except:
            data = {"success":False, 'message':'Failure - likely user already exists...'}
    return jsonify(data)