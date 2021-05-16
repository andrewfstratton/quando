from __main__ import app

import os
from os.path import join as os_join
from flask import jsonify

MEDIA_MAP = {
#   /TODO - refactor to videos & images
    'video': ['ogg', 'ogv', 'mp4', 'webm'],
    'audio': ['mp3', 'wav'],
    'images': ['bmp', 'jpg', 'jpeg', 'png', 'gif'],
    'objects': ['gltf', 'glb']
#    'objects': ['obj', 'mtl'],
}

# from flask import jsonify, request, session
# import server.common

@app.route('/file/upload', methods=['POST'])
def file_upload():
    return
    # data = server.common.decode_json_data(request)
    # script.create(data['name'], data['userid'], data['script'])
    # data = {"success":True}
    # return jsonify(data)

@app.route('/file/type/<path:path>')
def file_type_images(path):
    slash = path.find('/')
    if slash == -1:
        slash = len(path)
        folder = ''
    else:
        folder = path[slash+1:]
    media = path[:slash]
    suffixes = MEDIA_MAP[media]
    folderpath = os_join(app.root_path, 'client', 'media', folder)
    filtered = []
    folders = []
    for fs in os.scandir(folderpath):
        if fs.is_dir(follow_symlinks=True):
            folders.append(fs.name)
        elif fs.is_file(follow_symlinks=True):
            filename, extension = os.path.splitext(fs.name)
            if extension.startswith("."):
                extension = extension[1:]
                if extension in suffixes:
                    filtered.append(fs.name)
    data = {"success":True, "files": filtered, "folders": folders}
    return jsonify(data)