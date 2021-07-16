import sqlite3
from server.db import db
COLLECTION = 'user'

def create_if_not_exists():
    conn = sqlite3.connect('quando.db')
    create_table = """
        CREATE TABLE user (
            userid TEXT PRIMARY KEY NOT NULL,
            password TEXT NOT NULL
        )
    """
    print("Attempt to create table: " + COLLECTION)
    try:
        conn.execute(create_table)
        print("  ...created")
        create_user = "INSERT INTO user (userid, password) VALUES (?,?);"
        print("Create user 'test' with password 'test'")
        conn.execute(create_user, ('test','test'))
        conn.commit()
        conn.close()
    except sqlite3.OperationalError:
        print("  ...already exists")
    except sqlite3.Error as err:
        print(err.message)

def get_on_id_password(id, password):
    result = db.find(COLLECTION, 'userid=? AND password=?', (id, password))
    return len(result) == 1

def create(id, password):
    result = db.save(COLLECTION, "(userid, password) VALUES (?,?);", (id, password))
    return result