import sqlite3
from server.db import db
COLLECTION = 'user'

if __name__ == '__main__':
    conn = sqlite3.connect('quando.db')
    create_table = """
      CREATE TABLE IF NOT EXISTS user (
          userid TEXT PRIMARY KEY NOT NULL,
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
  result = db.find(COLLECTION, 'userid=? AND password=?', (id, password))
  return len(result) == 1

def create(id, password):
  result = db.save(COLLECTION, "(userid, password) VALUES (?,?);", (id, password))
  return result