
This is not yet working - on Lite account

IBM Cloud can be used to host Quando:Cloud using a free Lite Account by following the instructions below.

_It is assumed that you already have an IBM Cloud login._

# Adding the Github Quando:Cloud repository

Follow these instructions to automatically have the latest version of Quando:Cloud

1. From the Navigation Menu (top left) choose `DevOps` (circa halfway down)
2. (if needed) Change Location to London
3. Choose `Create toolchain +`
4. Type `Github` in the search box
5. Choose the option `Develop a Cloud Foundry app with DevOps Insights`
6. Change toolchain Name to `quando-ibm-cloud-devops`
7. (if needed)
   1. Choose `Authorize` (very near the bottom)
   2. Sign in to Github (Create an Account if you don't have one)
   3.  **Do Not Create Yet**
8.  In the Source Repository, paste `https://github.com/andrewfstratton/quando`
9.  Now choose `Create`
10. You will be asked to provide an IBM Cloud API key - choose `New +` then `OK`
11. Wait for a short while, then `Create`
12. You will see the `quando-cloud-devops` Toolchain page, with Github `Setting up...`
13. When it has finished setting up, **DO NOT Commit a change...** as suggested.
14. The `Delivery Pipeline` item (third from the left) should show `In progress`.  This will Fail if left to finish.  
15. Click on the `Delivery Pipeline` item
16. In the next page, click on the BUILD item  settings 'cog' (top  right of the BUILD item) and choose `Configure Stage`
17. Click on the `Unit Test a...` item and then click `Remove` and confirm `Remove`
18. Change the Builder type to `Simple` (at the top of the list), then `Save`
19. Click on the Setting cog for `STAGING` then choose `Configure Stage`
20. Click on `FVT Test` then `Remove` and confirm `Remove`
21. Scroll to the bottom and change the Deploy script to hold: 
```
#!/bin/bash
cf push "${CF_APP}"
# View logs
# cf logs "${CF_APP}" --recent
```
22. Next `Save`
23. On the `GATE` settings cog choose ``
24. Click on the BUILD item `Run Stage` ('play' icon - left of the settings cog)
25. This will take a while - you may wish to click on `View logs and history`

**THIS FAILS - and will not build on Lite**

# Setting up the Quando:Cloud Cloudant Database.

<details><summary>If you already have Cloudant setup</summary>

The Lite account can only have one Cloudant instance, so you may reuse an existing service if you have one already.  In which case, you will need to skip to `Setting up a connection`.
</details>

## Setting up a Cloudant Service

To create the database service and start it running:

1. Open the Dashboard (top left menu)
2. Choose `Create resource`
3. Search the catalog for `cloudant`
4. Choose `Cloudant`
5. Leave as `Multitenant` (i.e. shared and free)
6. (if necessary) Change the region to London
7. Change the Instance name to `Cloudant-quando`
8. Choose `Create` (bottom right)

You will need to wait for the database to be started - the Status will then show as `Active`.  Next setup the connection...

## Setting up a connection

To create a named connection to the Cloudant database (this will be used by Quando:Cloud):

1. Open the `Resource List` (from the top left menu)
2. Click on the Service `Cloudant-quando`, i.e. the name of the Cloudant database service.
3. Choose `Connections` (on the left)
4. Choose `Create Connection +` (on the right)
5. 
