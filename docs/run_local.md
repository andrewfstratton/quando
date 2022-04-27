## Running Quando locally

The instructions below assume that if you are using Visual Studio Code, you have the golang extensions installed.

# Building Quando executable

The standard build does not include control of local keyboard/mouse to simplify the build process.

You can either:
- build from the command line, in C:\quando, with `go build .`
- or within VS Code
  - open the C:\quando as a workplace, then choose:
  - F5 or Ctrl-F5
  - or:
    - Run and Debug (or Ctrl+Shift+D)
    - select (if not selected) 'Launch File (quando)'
    - Select the green triangle just to the left of the Launch File...
      - or Press F5
  
## OPTIONAL - Full Build

This includes control of the local keyboard and mouse.

You will need to install GCC to build robotgo:
- Open https://sourceforge.net/projects/mingw-w64/files/Toolchains%20targetting%20Win64/Personal%20Builds/mingw-builds/8.1.0/threads-posix/seh/x86_64-8.1.0-release-posix-seh-rt_v6-rev0.7z to download the compressed code for 64 bit windows.
- If you don't have an uncompress program that works, download from https://www.7-zip.org/
- Extract the compressed file to `C:\mingw64` - _check that you do not have a mingw64 folder inside C:\mingw64_
- Add C:\mingw64\bin to your path (Windows - see https://stackoverflow.com/questions/5733220/how-do-i-add-the-mingw-bin-directory-to-my-system-path)
- Check GCC is installed by opening a (new) command line and typing 'gcc --version' - you should see something like 'gcc (x86_64-posix-seh-rev0, Built by MinGW-W64 project) 8.1.0...'
- Now open a command line at C:\quando and then run `go build -tags=full .`
  - or Restart VSCode
  - Select 'Full Run' from the Run and Debug option (at the top of the screen)
  - Use F5
    - or select the green triangle to run.

# Open the editor

On the same PC, open Chrome and open http://127.0.0.1/editor

You can also view the dashboard at http://127.0.0.1

Note: The client screen can be right clicked to allow you to select already deployed/created scripts - whichever one you open will be reopened next time you open 127.0.0.1/client.  This can also be done from the kiosk boot, so that a different interaction is loaded next time the PC reboots.

</details>

<details><summary>
Developing new Blocks
</summary>

An (in progress) guide to [Creating new Blocks](creating_new_blocks.md) is available.

The (in progress) [Manifesto](manifesto.md) is likely to be useful.

</details>