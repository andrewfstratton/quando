
## Running Quando locally

If Python is setup, then you can run Quando by double clicking `quando.bat` file in the `C:\Quando` directory.

_The command line window should not show any errors._

Developers should see below in 'Edit as Block/API/Framework Developer'

<details><summary>First time only setup</summary>

You will likely see a Firewall warning.  You should select at least 'Private Networks', then allow access.

To check Quando is running, in Chrome, open [the dashboard](from the popup or http://127.0.0.1) on the **same PC** you installed Quando on.

You should see two QR Codes and links to the Editor and Client.

_If you don't see the option, check the command line from before._
</details>

<details><summary>
Run Quando on Startup
</summary>

**N.B. This is intended for deployed use - not for development**

1. Type Windows+R, then type in `gpedit.msc` and Enter
2. Choose Computer Configuration->Windows Settings->Scripts->Startup
3. Then 'Add' C:\quando\quando.bat
</details>

<details><summary>
Edit as Block/API/Framework Developer
</summary>

The instructions below assume that you are using Visual Studio Code, though specifics are generally avoided.

Run the editor, then:
1. Run Quando, in a terminal, with `python server.py`
2. In the popup window, choose `Dashboard` or `Editor` for editing or `Client`
3. If Chrome does not open, then open a Chrome browser to http://127.0.0.1

Note: The client screen can be right clicked to allow you to select already deployed/created scripts - whichever one you open will be reopened next time you open 127.0.0.1/client.  This can also be done from the kiosk boot, so that a different interaction is loaded next time the PC reboots.

</details>

<details><summary>
Develop new Blocks
</summary>

An (in progress) guide to [Creating new Blocks](creating_new_blocks.md) is available.

The (in progress) [Manifesto](manifesto.md) is likely to be useful.

</details>