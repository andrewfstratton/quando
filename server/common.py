import tkinter as tk
import json

_root = False

def getTkRoot():
    global _root
    if not _root:

        _root = TkRoot()
    return _root
    
class TkRoot(tk.Frame):
    def __init__(self):
        super().__init__()

    def get_master(self):
        return self.master

    def loop(self):
        self.get_master().mainloop()

def decode_json_data(req):
    str = req.data.decode('utf8')
    return json.loads(str)
