# Installing Quando:Cloud Locally

**These instructions allow the installation of Quando:Cloud on a local PC** usually for one of these reasons:
- Internet access is too slow, unreliable or absent.
- For development purpose.
- (currently) because Cloud access is limited.

## Prerequisites

Install these if you don't have them already:
<details><summary>1. Chrome browser</summary>

Quando has been developed with Chrome Browser.  Other browsers are untested, but may work.
</details>
<details><summary>2. Node JS</summary>

The LTS (Long Term-Support) version should be [downloaded from here](https://nodejs.org/en/download/) and then installed.

Tested with v14.15.4.

_Note: Standard installation also includes **npm** (Node package manager)._
</details>
<details><summary>(3. npm - Node Package Manager)</summary>

This is included, as standard, in the (previous) installation of NodeJS, so is unlikely to need installing separately.
</details>

## Installing Quando:Cloud

There are two main choices.  Where there is little, or no, internet access, then Option A should be chosen.  Otherwise Option B is preferable.

<details><summary>A. Offline PC Installation</summary>

This option suits a single PC (Windows 10, 64 bit, has been used at present) being used for interaction, e.g. within an offline area, such as inside a museum where Wifi and Ethernet are not available.  Note that HomeHub/Powerline may be an option to allow internet access without installing ethernet and/or accessing Wifi.

You need to, on an online PC (or with temporary internet access):

1. Download the zipped code from the [Quando Github Page](https://github.com/andrewfstratton/quando).  Choose the 'Code' Option and select 'Download ZIP:

    ![](./docs/images/code_download_zip.png)

2. Unzip the contents into the directory C:\Quando.
3. Open a command line (Windows-R, type '`cmd`' then press Return), then type in the command line:
    ```
    npm install
    ```
4. You can now
  - move the PC offline
  - or copy the contents of C:\Quando to a USB and then transfer to the Offline PC

**Updating Quando**

You can update Quando by repeating the above steps.

</details>
<details><summary>B. Online Installation - with updates available</summary>

This option allows a PC to be used:
  - as a 'Server' for other 'Client/Display' PCs.  The Client/Display PCs must be connected to the Server, e.g. by HomePlug, Ethernet or Wifi.
  - by non programming skilled _Inventors_ who invent interactions that can be automatically (re)deployed to Display PCs.
  - by programming skilled Block/framework Developers to add new devices, services, etc.  This option is detailed separately.

You need to:

1. Install [Git for Windows](https://gitforwindows.org/) - if not already installed
2. Open a command line (Windows-R, '`cmd`'then press Return), then type in the command line:
    ```
    mkdir C:\Quando
    cd C:\Quando
    git clone https://github.com/andrewfstratton/quando.git
    npm install
    ```

**Possible issues**

If you see errors about building sqlite3 (for windows), then try:

```
npm install -g windows-build-tools
```

**Updating Quando**

You can update quando, in a command line, using:
```
git pull
```

</details>

## Running Quando locally

You can run Quando by double clicking `quando.bat` file in the `C:\Quando` directory.

_The command line window should not show any errors._
<details><summary>First time only setup</summary>

You will likely see a Firewall warning.  You should select at least 'Private Networks', then allow access.

To check Quando server is running, in Chrome, open [The Quando Control Page](http://172.0.0.1) on the **same PC** you installed Quando on.

You should see some QR Codes and IP addresses, and at the bottom of the page, 'New User'.  Enter a login/user id and password.  **N.B. These are not secure.**  You should see a message at the bottom saying 'Added 'your user id'.

_If you don't see the option, check the command line from before, and also check that you are using the PC you installed Quando on - You can only add users on the PC that Quando is installed on._
</details>

# Optional Extras

You may wish to:

<details><summary>
Setup Quando:Cloud to run on Startup
</summary>

**N.B. This is intended for deployed use - not for development**

1. Type Windows+R, then type in `gpedit.msc` and Enter
2. Choose Computer Configuration->Windows Settings->Scripts->Startup
    1. Then 'Add' C:\quando\quando.bat
    2. (optional) follow the next instructions for Client browser setup - *(where you have a client display running on the server as well)*
</details>
<details><summary>
Edit as Block/API/Framework Developer
</summary>

The instructions below assume that you are using Visual Studio Code, though specifics are generally avoided.

Run the editor, then:
1. In a terminal, run pouchdb using `npm run pouchdb`
    - _Note that the PouchDB log file is in pouchdb/log.txt_
2. Run the server, in another terminal, with nodemon using `npm run nodemon`
3. Open a Chrome browser to http://127.0.0.1
    * Note: you can change a user's password (or delete a user) through the PouchDB Control Panel - available through the hub page, i.e. at http://127.0.0.1:5984/_utils.

Note: The client screen can be right clicked to allow you to select already deployed/created scripts - whichever one you open will be reopened next time you open 127.0.0.1/client.  This can also be done from the kiosk boot, so that a different interaction is loaded next time the PC reboots.

</details>
<details><summary>
Develop new Blocks
</summary>

An (in progress) guide to [Creating new Blocks](creating_new_blocks.md) is available.

The (in progress) [Manifesto](manifesto.md) is likely to be useful.

</details>