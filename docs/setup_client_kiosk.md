
### Client browser Kiosk setup
_i.e. allow PC to boot straight into client browser interaction_

The following setup can be done (by itself) on any client machine.

Split into - Quando:Cloud installed locally or not 

1. Download the file [kiosk.bat](https://github.com/andrewfstratton/quando/blob/master/kiosk.bat) into `C:\Quando` directory

2. Edit the kiosk.bat file:
   1. (if necessary) change the location of Chrome
   2. Change the parameter `127.0.0.1/client` to the url of the Quando:Cloud host, e.g. `yourhost.org/client`
3. Create a folder `c:\quando\chrome_user`
4. Run quando\kiosk.bat
5. Then choose the interaction you want to automatically load on booting.
  - _Note: You can right click the screen to go back to the client setup_
6. Type Windows+R, then type in `gpedit.msc` and Enter
    * Choose Computer Configuration->Windows Settings->Scripts->Startup
    * Then 'Add' C:\quando\kiosk.bat to autostart Chrome

If everything is fine - then try restarting to check everything boots correctly.
