# Quando - Visual Programming for Digital Interactive Exhibits

Quando currently be installed:

- locally - please [see these instructions](./docs/install_local.md).
- or in Codio - see [instructions](./docs/install_codio.md)

## Using the Quando:Editor

**N.B. The details below assume the server will be running locally on http://127.0.0.1, please replace with https://word2-word2-4567.codio.io for a Codio installation.**

You can open the editor called 'Inventor' from the (small) popup window or by opening [127.0.0.1/inventor](127.0.0.1/inventor) in Chrome browser.

_You may also replace 127.0.0.1 with another PC's IP address or a hostname_

## Using the Quando:Client

After you have deployed scripts, you can open them directly from the (small) popup window or through [127.0.0.1/client](127.0.0.1/client) in Chrome browser, which will load the last script that was opened.  You can right click the screen to choose a different script to load.

### Optional - Leap Motion
To use the Leap Motion, the (now archived) Leap Motion 3.2.1 (Orion Beta) software needs to be installed on a Windows Client PC, i.e. where the Leap motion is plugged in and where the browser will be run. The SDK is not needed.  The software may be downloaded from [here](https://leapmotion-developer.squarespace.com/releases/leap-motion-orion-321).

After installing the Leap Motion Control Panel, the recommended settings are:
- Enable in General - disable everything else
  - Allow Web Apps
  - Allow Background ...
  - Robust Mode
  - Auto Orient ...
- Enable in Troubleshooting - disable everything else
  - Low Resource Mode
  - Avoid Poor Performance

### Client browser Kiosk setup - allows PC to boot straight into client browser interaction

Follow [these instructions](./docs/setup_client_kiosk.md)

## Developing new Blocks

You should install Quando locally to develop new blocks.
