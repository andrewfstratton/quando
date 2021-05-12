from __main__ import app

# import os
from os.path import join as os_join
from flask import send_from_directory, send_file

@app.route('/')
def index():
    return send_file(os_join(app.root_path, 'dashboard', 'index.html'))

@app.route('/<path:path>')
def dashboard(path):
    return send_from_directory(os_join(app.root_path, 'dashboard'), path)