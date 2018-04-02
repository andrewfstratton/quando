# Quando
## Visual Programming for Digital Interactive Exhibits

### To Deploy in Windows - tested with Windows Server 2016 (and 10 Pro)

Prerequisites: Chrome, Node JS, mongoDB (complete install in c:\mongodb), git for windows install (https://gitforwindows.org/)

1. Clone the repository in C: using git clone https://github.com/andrewfstratton/quando.git
2. In the command line, in C:\quando, npm update - this will likely take a while
3. you may need to rebuild the serial-port, if so, then:
    1. (may need) npm install --global --production windows-build-tools
    2. npm install serialport --build-from-source
4. Download blockly from github (most likely) and unzip into C:\quando\blockly

### To add the automatic startup
1. using Windows R, run gpedit.msc
2. Choose Computer Configuration->Windows Settings->Scripts->Startup
    1. Then 'Add' C:\quando\mongodb.bat and c:\quando\quando.bat (second)
3. mkdir c:\mongodb\data\db
    1. Run mongodb.bat from the command line (just this once) - you will need to use another command line
- Note: you may need to edit mongodb.bat to change the location of data and logfile
4. run c:\mongodb\bin\mongo
    1. use quando
    2. db.user.insert({_id:'test',password:'text'})
5. run quando (which runs node app.js)
6. Then open 127.0.0.1/editor for the editor, login as test/test
7. and 127.0.0.1/client/setup to choose a deployed behaviour (and see external IP address)

If everything is fine - then try restarting to see if everything boots correctly - and test remotely to be sure that you can edit remotely.

Optional - npm install -g nodemon

To update (assuming quando has changed), First kill the Node.js process in the task manager,
then use:
git pull
quando
