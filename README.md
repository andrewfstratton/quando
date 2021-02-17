# Quando - Visual Programming for Digital Interactive Exhibits

Currently, limited use of Quando:Cloud may be available by request from A.Stratton@sheffield.ac.uk.

Quando:Cloud may be installed locally - please [see these instructions](./docs/install_local_cloud.md)

Quando can also be [deployed to IBM Cloud](./docs/ibm_cloud_install.md)

## Quando:Client Prerequisites

You will need to install Chrome Browser if you don't have it already.

### Client browser Kiosk setup
_i.e. allow PC to boot straight into client browser interaction_

The following setup can be done (by itself) on any client machine.

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

### Optional - Leap Motion
To use the Leap Motion, the standard Leap Motion (Orion) software needs to be installed on the Client PC, i.e. where the Leap motion is plugged in and where the browser will be run. The SDK is not needed.

Note: Web Apps must be enabled for using the leap Motion - in Windows, you may need to see [How to keep Leap Motion web apps enabled](https://forums.leapmotion.com/t/allow-web-apps-setting-resets-on-pc-on-computer-restart/8057).

## Editing as a Developer

You will need to install Quando:Cloud locally.

