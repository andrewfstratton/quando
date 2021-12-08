from __main__ import app

from os.path import join as os_join
from flask import send_from_directory, send_file

# Javascript only
@app.route('/common/<path:path>')
def common_index(path):
    return send_from_directory(os_join(app.root_path, 'common'), path, mimetype="application/javascript")

@app.route('/favicon.ico')
def favicon():
    return send_file(os_join(app.root_path, 'editor', 'favicon.ico'))
