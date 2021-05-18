from __main__ import app

import os
from os.path import join as os_join
from flask import jsonify, request

MEDIA_MAP = {
    'video': ['ogg', 'ogv', 'mp4', 'webm'],
    'audio': ['mp3', 'wav'],
    'images': ['bmp', 'jpg', 'jpeg', 'png', 'gif'],
    'objects': ['gltf', 'glb']
#    'objects': ['obj', 'mtl'] // Used to be available - complex for end users
}
#  UPLOAD to contain all the other files types
MEDIA_MAP['UPLOAD'] = sum(MEDIA_MAP.values(), [])

def _split_on_first_slash(path):
    slash = path.find('/')
    if slash == -1:
        slash = len(path)
        suffix = ''
    else:
        suffix = path[slash+1:]
    prefix = path[:slash]
    return (prefix, suffix)

@app.route('/file/upload', methods=['POST'])
def file_upload():
    return file_upload_path("")

@app.route('/file/upload/<path:path>', methods=['POST'])
def file_upload_path(path):
    _file = request.files['file']
    print("#"+_file.filename)
    _file.save(os_join(app.root_path, 'client', 'media', path, _file.filename))
    data = {"success":True}
    return jsonify(data)

@app.route('/file/type/<path:path>')
def file_type_images(path):
    media, folder = _split_on_first_slash(path)
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