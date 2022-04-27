# Installing Quando Locally

## Prerequisites

Install these if you don't have them already:
<details><summary>1. Chrome browser</summary>

Quando has been developed with Chrome Browser.  Other browsers are untested, but may work.
</details>
<details><summary>2. Go tools</summary>

You will need to (currently) install Go on your (Windows 10/11 tested) PC.
</details>

## Installing Quando

Option A should be chosen when possible, but where there is little, or no, internet access, then Option B can be chosen.

<details><summary>A. Standard (online) Installation - with updates available</summary>

You need to:

1. Install [Git for Windows](https://gitforwindows.org/) - if not already installed
2. Open a command line (Windows-R, '`cmd`'then press Return), then type in the command line:
    ```
    cd \
    git clone https://github.com/andrewfstratton/quando.git
    ```
  _Note: This will leave Quando in the C:\quando directory_

**Updating Quando**

You can update quando, in a command line, in C:\quando, using:
```
git pull
```

</details>

# Running Quando
To run Quando, [follow these instructions](./run_local.md)