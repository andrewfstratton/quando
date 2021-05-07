from __main__ import app

from os.path import join as os_join
from flask import send_file, send_from_directory

@app.route('/inventor')
def inventor():
    return send_file(os_join(app.root_path, 'inventor', 'index.html'))

@app.route('/inventor/index.js')
def index_js():
    return send_file(os_join(app.root_path, 'inventor', 'index.js'))

@app.route('/inventor/js/<path:path>')
def js(path):
    return send_from_directory(os_join(app.root_path, 'inventor', 'js'), path)

@app.route('/inventor/img/<path:path>')
def img(path):
    return send_from_directory(os_join(app.root_path, 'inventor', 'img'), path)

@app.route('/inventor/css/<path:path>')
def css(path):
    return send_from_directory(os_join(app.root_path, 'inventor', 'css'), path)

@app.route('/inventor/help/<path:path>')
def help_(path):
    return send_from_directory(os_join(app.root_path, 'inventor', 'help'), path)

@app.route('/inventor/fonts/<path:path>')
def fonts(path):
    return send_from_directory(os_join(app.root_path, 'inventor', 'fonts'), path)