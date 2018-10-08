# Quando - Visual Programming for Digital Interactive Exhibits

## To Deploy in Windows - tested with Windows 10 Pro

Prerequisites: Firefox, Node JS, git for windows install (https://gitforwindows.org/)



1. Clone the repository in C: using git clone https://github.com/andrewfstratton/quando.git
2. In the command line, in C:\quando, npm update - this will likely take a while
3. you may need to rebuild the serial-port (this is only necessary if you wish to use a micro:bit), if so, then:
    1. (may need) npm install --global --production windows-build-tools
    2. npm install serialport --build-from-source
4. Download blockly from github (most likely) and unzip into C:\quando\blockly (only needed for reference to previous version of blockly)

_Note: Chrome can be used, but will need to be modified to work:_

1. _open chrome://flags/#autoplay-policy_
2. _change to 'no user gesture is required'_

### Setting up Quando for first time use

1. Run quando (which runs node app.js)
2. Open (in a browser) the url 'http://127.0.0.1:5984/_utils'
    1. Create a database called 'user' (top right)
    2. Click the '+' to the right of All Documents
    3. Choose '+ New Doc'
    4. Ctrl-A -> Delete, then paste the next line in:
        1. {"_id": "test", "password": "test"}
    5. Then choose 'Create Document'
3. Then open 127.0.0.1/editor for the editor, login as test/test

### To add automatic startup
1. using Windows R, run gpedit.msc
2. Choose Computer Configuration->Windows Settings->Scripts->Startup
    1. Then 'Add' C:\quando\quando.bat
    2. Then 'Add' C:\quando\kiosk.bat to autostart firefox *(where you have a client display running on the server as well)*
#### Client browser setup
The following setup can be done (by itself) on any client machine - though kiosk.bat will need to be copied over

1. Open Firefox
    1. Press Ctrl-Shift-A
    2. Scroll down and choose 'See more add-ons!'
    3. Type 'mpt fullscreen' in the search box
    4. Select it and add it to firefox
    5. Press Ctrl-Shift-A
    6. Enable the Add on
    7. Alt F4 to exit
2. Run quando\kiosk.bat
    1. Then choose the interaction you want to automatically load on booting.
    2. You can right click the screen to go back to the client setup.
If everything is fine - then try restarting to see if everything boots correctly - and test remotely to be sure that you can edit remotely.

### Optional - Leap Motion
The standard Leap Motion (Orion) software needs to be installed on the Client PC, i.e. where the Leap motion is plugged in and where the browser will be run. The SDK is not needed.

Optional - npm install -g nodemon

To update (assuming quando has changed), First kill the Node.js process in the task manager,
then use:
git pull origin master
quando

## Editing as a Developer

The instructions below assume that you are using Visual Studio Code, though specifics are generally avoided.

Then run the editor, you need to:
1. Run the pouchdb database, using `npm run pouchd`
2. Run `node app.js`, e.g. through Launch
3. Open a Browser to 127.0.0.1/inventor

To use a client, access 127.0.0.1/client from a browser. This will automatically re-open the last script. You can right click the display to go to a screen that allows you to select already deployed/created scripts - whichever one you open will be reopened next time you open 127.0.0.1/client. Note that _.js is special, and is the test script.

### Block Development

[Block Development](inventor/README.md)