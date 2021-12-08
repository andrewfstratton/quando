# Quando - Visual Programming for Digital Interactive Exhibits

Quando currently be installed:

- locally - please [see these instructions](./docs/install_local.md).
- or in Codio - see [instructions](./docs/install_codio.md)

## Using the Quando:Editor

**N.B. The details below assume the server will be running locally on http://127.0.0.1, please replace with https://word2-word2-4567.codio.io for a Codio installation.**

You can open the Editor from the (small) popup window or by opening [127.0.0.1/editor](127.0.0.1/editor) in Chrome browser.

_You may also replace 127.0.0.1 with another PC's IP address or a hostname_

## Using the Quando:Client

After you have deployed scripts, you can open them directly from the (small) popup window or through [127.0.0.1/client](127.0.0.1/client) in Chrome browser, which will load the last script that was opened.  You can right click the screen to choose a different script to load.

### Optional - Leap Motion
To use the Leap Motion, the latest Windows software v4.1.0+52211 must be installed on the Windows PC that will be the 'Client', i.e.  where the leap motion will be plugged in and the client interaction will be opened (in a web browser).  The software may be downloaded from [here](https://www2.leapmotion.com/v4.1-lmc-windows-sdk).

After installing the Leap Motion Control Panel, the recommended settings are:
- Enable in General - disable everything else
  - Allow Web Apps **ESSENTIAL**
  - Robust Mode
  - Auto-orient Tracking
- Enable in Troubleshooting - disable everything else
  - Low Resource Mode
  - Avoid Poor Performance

It is then advisable to plug in the Leap Motion and test it with the Diagnostic Visualizer - this can help identify lighting issues as well.

### Client browser Kiosk setup - allows PC to boot straight into client browser interaction

Follow [these instructions](./docs/setup_client_kiosk.md)

## Developing new Blocks

You should install Quando locally to develop new blocks.
