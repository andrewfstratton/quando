import tkinter as tk
import webbrowser

TAB = 2
WINDOW = 1

class CPanel(tk.Frame):
    def __init__(self):
        super().__init__()
        self.master.title("Quando : Control Panel")
        tk.Button(text = "Inventor", width=20, command=open_inventor).pack()
        tk.Button(text = "Client", width=20, command=open_client).pack()


def open_inventor():
    webbrowser.open("http://127.0.0.1:5000/inventor", new=TAB, autoraise=True)

def open_client():
    webbrowser.open("http://127.0.0.1:5000/client", new=WINDOW, autoraise=True)


def run():
    cPanel = CPanel()
    cPanel.mainloop()