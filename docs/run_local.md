## Running Quando locally

The instructions below assume that if you are using Visual Studio Code, you have the golang extensions installed.

# Building Quando executable

The standard build does not include control of (on PC) keyboard/mouse to simplify the build process.

You can either:
- build from the command line, in C:\quando, with `go build .`
- or within VS Code
  - open the C:\quando as a workplace, then choose:
  - F5 or Ctrl-F5
  - or:
    - Run and Debug (or Ctrl+Shift+D)
    - (select `Local (quando)`
    - Select the green triangle just to the left of the Launch File...
      - or Press F5
  
## OPTIONAL - Full Build/Run

This includes control of the (on PC) keyboard and mouse.

**You must have installed GCC for this to work** See [install local](install_local.md).

To run Quando:
- From VSCode:
  - Choose Run and Debug icon (on left)
  - (select 'Full (quando)i' - at the top of the screen)
  - select the green triangle to run (or F5 or Ctrl-F5 for debug)

For a full build, you can build an executable.  e.g. for Windows:
- open a command line at `C:\quando` and then run `build.bat`
- start `quando.exe`

<details><summary>
Developing new Blocks
</summary>

An (in progress) guide to [Creating new Blocks](creating_new_blocks.md) is available.

The (in progress) [Manifesto](manifesto.md) is likely to be useful.

</details>