# Quando - Visual Programming for Digital Interactive Exhibits

Currently, limited use of Quando:Cloud may be available by request from A.Stratton@sheffield.ac.uk.

Quando:Cloud may be installed locally - please [see these instructions](./docs/install_local_cloud.md).  You will need to do this if you are a Developer.

Quando can also be [deployed to IBM Cloud](./docs/install_ibm_cloud.md)

## Using the Quando:Editor

You will most likely open the editor from Quando:Cloud running locally - by opening [127.0.0.1/inventor](127.0.0.1/inventor) in Chrome browser.

_You may also replace 127.0.0.1 with another PC's IP address or a hostname_

## Using the Quando:Client

After you have deployed scripts, you can open them directly through [127.0.0.1/client](127.0.0.1/client) in Chrome browser, which will load the last script that was opened.  You can right click the screen to choose a different script to load.

### Optional - Leap Motion
To use the Leap Motion, the standard Leap Motion (Orion) software needs to be installed on the Client PC, i.e. where the Leap motion is plugged in and where the browser will be run. The SDK is not needed.

Note: Web Apps must be enabled for using the leap Motion - in Windows, you may need to see [How to keep Leap Motion web apps enabled](https://forums.leapmotion.com/t/allow-web-apps-setting-resets-on-pc-on-computer-restart/8057).

### Client browser Kiosk setup - allows PC to boot straight into client browser interaction

Follow [these instructions](./docs/setup_client_kiosk.md)