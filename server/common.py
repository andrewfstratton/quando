import tkinter as tk
import json

_root = False

def get_tk_root():
    global _root
    if not _root:

        _root = TkRoot()
    return _root

def get_tk_width_height():
    root = get_tk_root()
    return root.winfo_screenwidth(), root.winfo_screenheight()
    
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
