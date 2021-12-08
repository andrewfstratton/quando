import tkinter as tk
import webbrowser
import server.common
import server.db.script
import server.db.user

TAB = 2
WINDOW = 1

def _open(path):
    url = "http://127.0.0.1/" + path
    webbrowser.open(url, new=TAB, autoraise=True)

def open_editor():
    _open("inventor")

def open_client():
    _open("client")

def open_dashboard():
    _open("")

def run():
    # Create database tables if they don't exist
    server.db.script.create_if_not_exists()
    server.db.user.create_if_not_exists()

    # Show GUI
    try:
        root = server.common.get_tk_root()
        master = root.get_master()
        master.title("Quando : Control Panel")
        top = tk.Frame(master)
        top.pack()
        tk.Button(top, text = "Editor", width=20, command=open_editor).pack(side=tk.LEFT)
        tk.Button(top, text = "Client", width=20, command=open_client).pack(side=tk.LEFT)
        tk.Button(top, text = "Dashboard", width=20, command=open_dashboard).pack(side=tk.LEFT)
        root.loop()
    except tk.TclError:
        print("Running without (Tk) control panel")