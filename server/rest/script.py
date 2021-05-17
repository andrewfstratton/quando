from __main__ import app

import os
from os.path import join as os_join
from flask import jsonify, request, session
import server.common
from server.db import script

@app.route('/script', methods=['POST'])
def script_post():
    data = server.common.decode_json_data(request)
    script.create(data['name'], data['userid'], data['script'])
    data = {"success":True}
    return jsonify(data)

@app.route('/script/names/<userid>')
def script_get_names(userid):
    names = script.get_on_userid(userid)
    data = {"success":True, "list": names}
    return jsonify(data)

@app.route('/script/id/<id>')
def script_get_on_id(id):
    row = script.get_on_id(id)
    if row:
        name, _script = row
        data = {"success":True, "name": name, "script": _script}
    else:
        data = {"success":False, "message": "Script not found"}
    return jsonify(data)

@app.route('/script/id/<id>', methods=["DELETE"])
def script_delete_on_id(id):
    script.delete_on_id(id)
    data = {"success":True}
    return jsonify(data)

@app.route('/script/tidy/<name>/id/<id>', methods=["DELETE"])
def script_tidy_on_id(name, id):
    script.tidy_on_id(name, id)
    data = {"success":True}
    return jsonify(data)

@app.route('/script/name/<name>', methods=["DELETE"])
def script_delete_on_name(name):
    script.delete_on_name(name)
    data = {"success":True}
    return jsonify(data)

@app.route('/script/deploy/<filename>', methods=["PUT"])
def script_deploy(filename):
    data = server.common.decode_json_data(request)
    code = data['javascript']
    file_loc = os_join(app.root_path, 'client', 'deployed_js', filename + '.js')
    try:
        with open(file_loc, "w") as file_out:
            file_out.write(code)
        data = {"success":True}
    except Exception as ex:
        data = {"success":False, "message":str(ex)}
    return jsonify(data)