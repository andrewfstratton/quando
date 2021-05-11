import sqlite3
from os.path import join as os_join

_path = ''

def set_path_for_db(path):
    global _path
    _path = path

def _get_conn():
    conn = sqlite3.connect(os_join(_path, 'quando.db'))
    return conn

def query(qry, tuple):
    conn = _get_conn()
    cursor = conn.cursor()
    result = cursor.execute(qry, tuple).fetchall()
    conn.close()
    return result