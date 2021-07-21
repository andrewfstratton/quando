# Installing Quando in Codio

_This guide assumes you already know how to find the name of your Codio hosting and that you can create a project._

## Prerequisites

Install these if you don't have them already:
<details><summary>1. Chrome browser</summary>

Quando has been developed with Chrome Browser.  Other browsers are untested, but may work.  Chrome will be needed for editing and running scripts.
</details>

## Installing Quando

1. In Codio home (http://codion.com/home):
   1. Choose `New project` (top left)
   2. In (1) choose `Python` (second option)
   3. In (2) enter a `NAME` for your project, e.g. 'quando'
   4. Choose `Create` (bottom left)
2. In the new project, in a terminal:
   1. In a terminal, type `git clone https://github.com/andrewfstratton/quando.git`
   2. then `cd quando`
   3. Optional - need to check `install.bat` for changes
   4. enter `python3 - pip flask flask-socketio`
   5. If pip doesn't work, then you will need to install it (https://pip.pypa.io/en/stable/installing/)

# Running Quando
To run Quando:
1. In the `quando` folder, run `python3 server.py`
   
This will also (first time) create an Sqlite database with a user `test` with a password of `test`.

You can open the dashboard with https://word1-word2-4567.codio.io, where you can create a new user and open an editor.
  
## Updating Quando

You can update quando, in a command line, in C:\quando, using:
```
git pull
```