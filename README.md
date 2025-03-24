# Quando - Visual Programming for Digital Interactive Exhibits

## What is Quando?

Quando looks similar to the Scratch 'block' editor often used for learning to program, or for end user development.

However, Quando does not use standard programming concepts and **does not expect users to learn to program** and is aimed at End User Development.

## Who is Quando for?

Quando is aimed at end users and domain experts wishing to create and edit digital interactions without having to become programmers.

## What can Quando do?

The main benefits of Quando are:

- **Very quick** creation of simple (i.e. not deep, but typically shallow) interactions
- **Exploring** different interaction options and choosing between different options quickly
- **Discovering** different ways to interact and **learning** about different inputs and outputs and how they work for (other) users

## What types of inputs are available?

Quando allows many different inputs (and more are being added), including:

- Leap Motion hand movement in 3 dimensions and rotation in 3 'angles' (six degrees of freedom)
- Mouse and Keyboard
- micro:bit keys, orientation and (version 2 only) touch
- Gamepad input (from browser)
- (experimental) EEG headset
- (experimental) speech recognition

## What types of output are available?

Some of these outputs also include inputs:

- digital media - images, video, audio and (experimental) sound waves
- (in progess) 3d object/scene
- (experimental) Augmented Reality
- Speech
- Control of (local PC) mouse and keyboard
- (experimental) Nao Robot control including full movement, speech, etc.
- (experimental) microbit servo contol and esp32 (display)

## What can Quando be used for?

Quando has been used for:

- interactive exhibits for museums, typically using the touchless Leap motion controller to interact with information displays
- touchless interactive control of robots to aid understanding of robot abilites
- 

## Why is it called Quando?

The name Quando comes from Latin for 'when' since Quando use a When based approach to describing behaviour rather than an if based approach. 

# Installing Quando 

Quando can currently be installed:

- On PC (windows tested) as a local server - please [see these instructions](./docs/install_local.md).  You should only need to do this once.
- (NYI) Cloud - this installation will not include control of (PC) keyboard, mouse, or access to connected (USB) devices.

# Running Quando

To run Quando locally, [follow these instructions](./docs/run_local.md)

## Building Quando as a separate executable

Quando can be **built** for three different deployments:

1. (typical) local - which includes access to USB devices and typically runs on a PC
2. full - the same as local but also including control of mouse and keyboard which may be **UNSAFE**. _See also below re. running Quando_
3. cloud - without either the above tags - this build does not access any local devices or have access to keyboard or mouse and is intended for cloud deployment

## Runtime options for remote access

At the command line, there is one option for allow remote access:

- -remote
  - allows editing and running of scripts from other machines - e.g.  by scanning the QR Code from the hub at 127.0.0.1.  _Note: testing scripts will also work_
  - N.B.  if quando has been built with 'full', then this is **UNSAFE** since scripts can control the PCs keyboard and mouse 

Otherwise, the client and editor are **only available to the local, i.e. on PC, browser** 

# Using the Quando:Editor

You can open the Editor from the dashboard at [127.0.0.1](127.0.0.1) or by opening [127.0.0.1/editor](127.0.0.1/editor) in Chrome browser.

## Using the Quando:Client

After you have deployed scripts, you can open them from the dashboard at [127.0.0.1](127.0.0.1) or through [127.0.0.1/client](127.0.0.1/client) in Chrome browser, which will load the last script that was opened.  You can `Ctrl right click the screen` to choose a different script to load.

### Updating Quando

Assuming you installed correctly, you can update quando, in a command line, in C:\quando, using:
```
git pull
```

### Optional - Leap Motion

To use the Leap Motion, an older version of the Windows software v4.1.0+52211 must be installed on the 'client' PC:

- i.e.  where the leap motion will be plugged in and the client interaction will be opened (in a web browser)
- The software may be downloaded from [here](https://www2.leapmotion.com/downloads/orion/v4.1.0/windows).
  - Note: this will download a zip and also open the newer software page - which you should ignore.
- You will need to extract the zip contents
- then run the 'Leap_Motion_Installer...' - you can uncheck 'Launch Browser for VR Setup'.

After installing the Leap Motion Control Panel, the recommended settings are:
- Enable in General - disable everything else
  - Allow Web Apps **ESSENTIAL**
  - Robust Mode
  - Auto-orient Tracking
  - DISABLE Automatically Install Updates
- Enable in Troubleshooting
  - Low Resource Mode
  - Avoid Poor Performance

It is then advisable to plug in the Leap Motion and test it with the Diagnostic Visualizer - this can help identify lighting issues as well.

### Client browser Kiosk setup - allows PC to boot straight into client browser interaction

Follow [these instructions](./docs/setup_client_kiosk.md)

## Developing new Blocks

You should install Quando locally to develop new blocks.
