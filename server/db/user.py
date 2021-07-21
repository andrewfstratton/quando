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
    try:
        conn.execute(create_table)
        print("Created table (first time run): " + COLLECTION)
        create_user = "INSERT INTO user (userid, password) VALUES (?,?);"
        conn.execute(create_user, ('test','test'))
        conn.commit()
        conn.close()
        print("Created user 'test' with password 'test'")
    except sqlite3.OperationalError:
        pass
    except sqlite3.Error as err:
        print("ERROR trying to create table " + COLLECTION + ": " + err.message)

def get_on_id_password(id, password):
    result = db.find(COLLECTION, 'userid=? AND password=?', (id, password))
    return len(result) == 1

def create(id, password):
    result = db.save(COLLECTION, "(userid, password) VALUES (?,?);", (id, password))
    return result