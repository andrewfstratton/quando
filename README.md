# Quando
## Visual Programming for Digital Interactive Exhibits

### To Deploy in Windows - tested with Windows Server 2016 (and 10 Pro)

Prerequisites: Chrome, Node JS, mongoDB (complete install in c:\mongodb), github windows install

1. Clone the repository in C: using git clone https://github.com/andrewfstratton/quando.git
2. In the command line, in C:\quando, npm update - this will likely take a while
3. Download blockly from github (most likely) and unzip into C:\quando\blockly

### To add the automatic startup
1. using Windows R, run gpedit.msc
2. Choose Computer Configuration->Windows Settings->Scripts->Startup
2.1. then 'Add' C:\quando\mongodb.bat and c:\quando\quando.bat (second)
3. mkdir c:\mongodb\bin\data
3.1. Run mongodb.bat from the command line (just this once) - you will need to use another command line
- Note: you may need to edit mongodb.bat to change the location of data and logfile
4. run c:\mongodb\bin\mongo
4.1. use quando
4.2. db.user.insert({_id:'test',password:'text'})
5. run node app.js
6. Then open 127.0.0.1/editor for the editor, login as test/test
7. and 127.0.0.1/client/setup to choose a deployed behaviour (and see external IP address)

If everything is fine - then try restarting to see if everything boots correctly - and test remotely to be sure that you can edit remotely.
