import tkinter as tk
import webbrowser
import server.common

TAB = 2
WINDOW = 1

def open_inventor():
    webbrowser.open("http://127.0.0.1:5000/inventor", new=TAB, autoraise=True)

def open_client():
    webbrowser.open("http://127.0.0.1:5000/client", new=WINDOW, autoraise=True)

def run():
    root = server.common.getTkRoot()
    master = root.get_master()
    master.title("Quando : Control Panel")
    top = tk.Frame(master)
    top.pack()
    tk.Button(top, text = "Inventor", width=20, command=open_inventor).pack(side=tk.LEFT)
    tk.Button(top, text = "Client", width=20, command=open_client).pack(side=tk.LEFT)
    root.loop()