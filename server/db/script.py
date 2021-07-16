import sqlite3, datetime
from server.db import db
from urllib.parse import unquote
COLLECTION = 'script'

def create_if_not_exists():
    conn = sqlite3.connect('quando.db')
    create_table = """
      CREATE TABLE script (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userid TEXT NOT NULL,
          name TEXT NOT NULL,
          date TEXT NOT NULL,
          script TEXT NOT NULL
      )
    """
    print("Attempt to create table: " + COLLECTION)
    try:
        conn.execute(create_table)
        print("  ...created")
        conn.commit()
        conn.close()
    except sqlite3.OperationalError:
        print("  ...already exists")
    except sqlite3.Error as err:
        print(err.message)

def get_on_userid(userid):
    rows = db.find(COLLECTION, 'userid=? ORDER BY date DESC', (userid,))
    result = []
    for row in rows:
        result.append({'id':row['id'], 'userid':row['userid'],
            'name':unquote(row['name']), 'date':row['date'], 'script':row['script']})
    return result

def create(name, userid, script):
    date = str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    result = db.save(COLLECTION, "(name, userid, date, script) VALUES (?,?,?,?);",
        (name, userid, date, script))
    return result

def get_on_id(id):
    result = None
    rows = db.find(COLLECTION, 'id=?', (id,))
    if len(rows) == 1:
      row = rows[0]
      name = unquote(row['name'])
      script = row['script']
      result = (name, script)
    return result

def delete_on_id(id):
    db.delete(COLLECTION, "id = ?", (id,))

def tidy_on_id(name, id):
    db.delete(COLLECTION, "name = ? AND id != ?", (name, id))

def delete_on_name(name):
    db.delete(COLLECTION, "name = ?", (name,))