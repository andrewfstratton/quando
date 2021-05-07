from __main__ import app

from os.path import join as os_join
from flask import send_file

@app.route('/common/text.js')
def text_js():
    return send_file(os_join(app.root_path, 'common','text.js'))

@app.route('/favicon.ico')
def favicon():
    return send_file(os_join(app.root_path, 'inventor', 'favicon.ico'))
