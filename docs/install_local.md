# Installing Quando Locally

## Prerequisites

Install these (if you don't have them already):
<details><summary>1. Go tools</summary>

You will need to (currently) install Go on your (Windows 10/11 tested) PC - you may install this when using VS Code.
</details>

<details><summary>2. Chrome browser (recommended, if not already installed)</summary>

Quando has been developed with Chrome Browser.  Other browsers are untested, but may work.
</details>

<details><summary>3. Optional - GCC compiler - for the 'Full' features of Quando</summary>

This is needed if you wish to control the keyboard/mouse on your (tested on windows) PC.

You will need to install GCC to build robotgo:

1. Open https://sourceforge.net/projects/mingw-w64/files/Toolchains%20targetting%20Win64/Personal%20Builds/mingw-builds/8.1.0/threads-posix/seh/x86_64-8.1.0-release-posix-seh-rt_v6-rev0.7z to download the compressed code for 64 bit windows.
2. If you don't have an uncompress program that works, download from https://www.7-zip.org/
3. Extract the compressed file to `C:\mingw64` - _check that you do not have a mingw64 folder inside C:\mingw64_
4. Add C:\mingw64\bin to your path:
  - Press the windows key and type `environment` then choose 'Edit the System environment variables'
  - Choose `Environment Variables` at the bottom
  - in the bottom panel 'System Variables', select 'Path' then `Edit`
  - Choose `New` then type in `C:\mingw64\bin` then choose `OK` (three times)

To check that gcc is installed:
- Open a **new** command line and typing 'gcc --version'
  - you should see something like 'gcc (x86_64-posix-seh-rev0, Built by MinGW-W64 project) 8.1.0...'

</details>

## Installing Quando

<details><summary>Standard (online) Installation - with updates available</summary>

You need to (tested on Windows):

1. Install [Git for Windows](https://gitforwindows.org/) - if not already installed
2. Open a command line (Windows-R, '`cmd`'then press Return), then type in the command line:
    ```
    cd \
    git clone https://github.com/andrewfstratton/quando.git
    ```
  _Note: This will install Quando in the C:\quando directory_

</details>
