import sqlite3
from os.path import join as os_join

_path = ''

def set_path_for_db(path):
    global _path
    _path = path

def _get_conn():
    conn = sqlite3.connect(os_join(_path, 'quando.db'))
    return conn

def find(table, where, tuple):
    conn = _get_conn()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    qry = "SELECT * from " + table + " WHERE " + where
    cursor.execute(qry, tuple)
    result = cursor.fetchall()
    conn.close()
    return result

def save(table, suffix, tuple):
    conn = _get_conn()
    cursor = conn.cursor()
    qry = "INSERT INTO " + table + suffix
    cursor.execute(qry, tuple)
    result = cursor.lastrowid
    conn.commit()
    conn.close()
    return result

def delete(table, suffix, tuple):
    conn = _get_conn()
    cursor = conn.cursor()
    qry = "DELETE FROM " + table + " WHERE " + suffix
    cursor.execute(qry, tuple)
    conn.commit()
    conn.close()