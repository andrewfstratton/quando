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

## Installing Quando:Cloud

Option A should be chosen when possible, but where there is little, or no, internet access, then Option B can be chosen.

<details><summary>A. Standard (online) Installation - with updates available</summary>

You need to:

1. Install [Git for Windows](https://gitforwindows.org/) - if not already installed
2. Open a command line (Windows-R, '`cmd`'then press Return), then type in the command line:
    ```
    cd \
    git clone https://github.com/andrewfstratton/quando.git
    cd quando
    npm install
    npm run install_pouchdb
    ```
_Note: This will leave Quando in the C:\quando directory_

**If you see errors about building sqlite3 (for windows), then try:**

```
npm install -g windows-build-tools
```

**Updating Quando**

You can update quando, in a command line, in C:\quando, using:
```
git pull
```

</details>

<details><summary>B. Offline (no internet) PC Installation</summary>

This option suits a single PC (Windows 10, 64 bit, has been used at present) being used for interaction, e.g. within an offline area, such as inside a museum where Internet access is unavailable or too slow.

You need to, on an online PC (or with temporary internet access):

1. Download the zipped code from the [Quando Github Page](https://github.com/andrewfstratton/quando).  Choose the 'Code' Option and select 'Download ZIP:

    ![](./docs/images/code_download_zip.png)

2. Unzip the contents into the directory C:\Quando.
3. Open a command line (Windows-R, type '`cmd`' then press Return), then type in the command line:
    ```
    cd C:\Quando
    npm install
    npm run install_pouchdb
    ```
4. You can now
  - move the PC offline
  - or copy the contents of C:\Quando to a USB and then transfer to the Offline PC

You can update Quando:Cloud by repeating the above steps.

</details>

# Running Quando:Cloud locally.
To run locally, [follow these instructions](./running_local_cloud.md)