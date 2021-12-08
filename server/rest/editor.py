from __main__ import app

from os.path import join as os_join
from flask import send_file, send_from_directory

@app.route('/editor/')
def editor():
    return send_file(os_join(app.root_path, 'editor', 'index.html'))

@app.route('/editor/index.js')
def index_js():
    return send_file(os_join(app.root_path, 'editor', 'index.js'), mimetype="application/javascript")

@app.route('/editor/js/<path:path>')
def js(path):
    return send_from_directory(os_join(app.root_path, 'editor', 'js'), path, mimetype="application/javascript")

@app.route('/editor/img/<path:path>')
def img(path):
    return send_from_directory(os_join(app.root_path, 'editor', 'img'), path)

@app.route('/editor/css/<path:path>')
def css(path):
    return send_from_directory(os_join(app.root_path, 'editor', 'css'), path)

@app.route('/editor/help/<path:path>')
def help_(path):
    return send_from_directory(os_join(app.root_path, 'editor', 'help'), path)

@app.route('/editor/fonts/<path:path>')
def fonts(path):
    return send_from_directory(os_join(app.root_path, 'editor', 'fonts'), path)