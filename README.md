# Quando
## Visual Programming for Digital Interactive Exhibits

### To Deploy in Windows - tested with Windows Server 2016 (and 10 Pro)

Prerequisites: Chrome, Node JS, mongoDB (complete install in c:\mongodb) running as a service (see at bottom)

1. EITHER Get the repository as a copy
1.1. As a zip from github.com/andrewfstratton/quando
1.2. Unzip to c:\ or wherever you like - the zip creates a folder called quando-master
1.3. Rename the folder to C:\quando
3. OR clone the repository in C: using git clone https://github.com/andrewfstratton/quando.git
4. In the command line, in C:\quando, npm update - this will likely take a while
5. Download blockly from github (most likely) and unzip into C:\quando\blockly

### To run

- in mongo shell, use quando, db.user.insert({_id:'test',password:'text'})
- run node app.js
- Then open 127.0.0.1/editor for the editor, login as test/test
- and 127.0.0.1/client/setup to choose a deployed behaviour (and see external IP address)

Note - to install mongodb as a service
Put mongodb bin directory in c:\mongodb
Mkdir c:\data
in c:\mongodb\bin:
create a mongodb.cfg file and add:
-------
systemLog:
    destination: file
    path: c:\data\mongod.log
storage:
    dbPath: c:\data
-------
then run:
    cmd.exe <<Ctrl-Shft-Enter>>
    .\mongod --config c:\mongo
    db\bin\mongodb.cfg --install

