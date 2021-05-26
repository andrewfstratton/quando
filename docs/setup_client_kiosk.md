
### Client browser Kiosk setup
_i.e. allow PC to boot straight into client browser interaction_

The following setup can be done (by itself) on any client machine.

1. locate the file [kiosk.bat] in the `C:\Quando` directory

2. Edit the kiosk.bat file
   - (if necessary) change the location of Chrome
3. Create a folder `c:\quando\chrome_user`
4. Run quando\kiosk.bat
5. Then choose the interaction you want to automatically load on booting.
  - _Note: You can right click the screen to go back to the client setup_
6. Type Windows+R, then type in `gpedit.msc` and Enter
    * Choose Computer Configuration->Windows Settings->Scripts->Startup
    * Then 'Add' C:\quando\kiosk.bat to autostart Chrome

N.B. Quando will also need to be [Setup to run on startup](run_local.md)

If everything is fine - then try restarting to check everything boots correctly.
