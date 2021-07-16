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

def open_inventor():
    _open("inventor")

def open_client():
    _open("client")

def open_dashboard():
    _open("")

def run():
    # Show GUI
    root = server.common.get_tk_root()
    master = root.get_master()
    master.title("Quando : Control Panel")
    top = tk.Frame(master)
    top.pack()
    tk.Button(top, text = "Inventor", width=20, command=open_inventor).pack(side=tk.LEFT)
    tk.Button(top, text = "Client", width=20, command=open_client).pack(side=tk.LEFT)
    tk.Button(top, text = "Dashboard", width=20, command=open_dashboard).pack(side=tk.LEFT)
    root.loop()