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

**You must have installed GCC for this to work**

To run Quando:
- either open a command line at C:\quando and then run `go build -tags=full .`
- or from VSCode, do one of:
  - Select 'Full Run' from the Run and Debug option (at the top of the screen)
  - Use F5
  - or select the green triangle to run.

<details><summary>
Developing new Blocks
</summary>

An (in progress) guide to [Creating new Blocks](creating_new_blocks.md) is available.

The (in progress) [Manifesto](manifesto.md) is likely to be useful.

</details>