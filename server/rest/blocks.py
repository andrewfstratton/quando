from __main__ import app

import os
from os.path import join as os_join
from flask import jsonify

@app.route('/blocks')
def blocks():
    directory = os_join(app.root_path, 'blocks')
    blocks = []
    for folder in os.listdir(directory):
        menu = {'title':True}
        parts = folder.split("_")
        del parts[0] # remove the numeric prefix
        name = ''
        class_ = ''
        for part in parts:
            class_ += part + '-'
            name += part.capitalize() + ' '
        menu['class'] = class_[:-1] # removes extra '-'
        menu['name'] = name[:-1] # removes extra ' '
        menu['folder'] = folder
        blocks.append(menu)
        get_files(blocks, folder)
    data = {"blocks":blocks, "success":True}
    return jsonify(data)

def get_files(blocks, folder):
    try:
        for file_ in os.listdir(os_join(app.root_path, 'blocks', folder)):
            block = {}
            if file_.endswith(('.htm','.html')):
                block['title'] = False
                type = file_.split('_',1)[1]  # remove before _
                type = type.split('.',-1)[0]
                type = type.replace('_', '-')
                block['type'] = type
                with open(os_join(app.root_path, 'blocks', folder, file_), encoding="utf-8") as fs:
                    block['html'] = fs.read()
            blocks.append(block)
    except Exception as ex:
        print(ex)