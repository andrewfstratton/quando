
## Running Quando:Cloud locally

For creating new interactions, you can run Quando:Cloud by double clicking `quando.bat` file in the `C:\Quando` directory.

_The command line window should not show any errors._

Developers should see below in 'Edit as Block/API/Framework Developer'

<details><summary>First time only setup</summary>

You will likely see a Firewall warning.  You should select at least 'Private Networks', then allow access.

To check Quando:Cloud is running, in Chrome, open [the dashboard](http://127.0.0.1) on the **same PC** you installed Quando:Cloud on.  This can also be opened as http://127.0.0.1

You should see two QR Codes and links to the Editor and Client, and at the bottom of the page, 'New User'.  Enter a login/user id and password.  **N.B. These are not secure.**  You should see a message at the bottom saying 'Added 'your user id'.

_If you don't see the option, check the command line from before, and also check that you are using the PC you installed Quando on - You can only add users on the PC that Quando is installed on._
</details>

<details><summary>
Run Quando:Cloud on Startup
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
1. In a terminal, run pouchdb using `npm run pouchdb`
    - _Note that the PouchDB log file is in pouchdb/log.txt_
2. Run Quando:Cloud, in another terminal, with nodemon using `npm run nodemon`
3. Open a Chrome browser to http://127.0.0.1
    * Note: you can change a user's password (or delete a user) through the PouchDB Control Panel - available through the Dashboard, i.e. at http://127.0.0.1:5984/_utils.

Note: The client screen can be right clicked to allow you to select already deployed/created scripts - whichever one you open will be reopened next time you open 127.0.0.1/client.  This can also be done from the kiosk boot, so that a different interaction is loaded next time the PC reboots.

</details>

<details><summary>
Develop new Blocks
</summary>

An (in progress) guide to [Creating new Blocks](creating_new_blocks.md) is available.

The (in progress) [Manifesto](manifesto.md) is likely to be useful.

</details>