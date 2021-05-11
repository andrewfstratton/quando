from __main__ import app

import sqlite3
from server.db.common import query

if __name__ == '__main__':
    conn = sqlite3.connect('quando.db')
    create_table = """
      CREATE TABLE IF NOT EXISTS user (
          userid TEXT PRIMARY KEY,
          password TEXT NOT NULL
      )
    """
    print("Attempt to create user table")
    conn.execute(create_table)
    create_user = "INSERT INTO user (userid, password) VALUES (?,?);"
    print("Create test user")
    # conn.execute(create_user, ('test','test'))
    conn.commit()
    conn.close()

def get_on_id_password(id, password):
  get_user = "SELECT * from user WHERE userid=? AND password=?"
  result = query(get_user, (id, password))
  return len(result) == 1