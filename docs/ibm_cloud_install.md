
This is not yet working - on Lite account

IBM Cloud can be used to host Quando:Cloud using a Lite Account by following the instructions below.


# 1. Adding the Github Quando:Cloud repository

Follow these instructions to deploy the latest version of Quando:Cloud.

1. Login to IBM Cloud
  - N.B. You will need to already have an IBM Cloud login.
2. Open the Quando repository at `https://github.com/andrewfstratton/quando`
3. Either:
  - To run (but not develop) Quando: [![Deploy to IBM Cloud](https://cloud.ibm.com/devops/setup/deploy/button.png)](https://cloud.ibm.com/devops/setup/deploy?repository=https%3A%2F%2Fgithub.com%2Fandrewfstratton%2Fquando.git&branch=master&env_id=ibm:yp:eu-gb)
  - Or to deploy the `dev` version: [Deploy dev to IBM Cloud](https://cloud.ibm.com/devops/setup/deploy?repository=https%3A%2F%2Fgithub.com%2Fandrewfstratton%2Fquando.git&branch=dev&env_id=ibm:yp:eu-gb)

4. Select the Delivery Pipeline (Required) 'tab'
5. Click `new` next to create a new IBM Cloud API key
6. Click `OK`
7. Wait, then click `Create`
8. You will need to wait for a few minutes for the Git `Setting up...` to finish
9. You should get a message saying `Your app is being created...`
10. This will take about 2 minutes to build and 5 minutes to deploy
  - You can click on the `Delivery Pipeline` as suggested.  You should see the `Build Stage` which will show `Queued` (maybe) then `Running` then `Passed now`, then the Deploy Stage showing `Running` then `Passed`

# 2. Setting up the Quando:Cloud Cloudant Database.

<details><summary>If you already have Cloudant setup</summary>

The Lite account can only have one Cloudant instance, so you may reuse an existing service if you have one already.  In which case, you will need to skip to `2.2 Setting up a connection`.
</details>

## 2.1 Setting up a Cloudant Service

To create the database service and start it running:

1. Open the Dashboard (top left menu)
2. Choose `Create resource`
3. Search the catalog for `cloudant`
4. Choose `Cloudant`
5. Leave as `Multitenant` (i.e. shared and free)
6. (if necessary) Change the region to London
7. Change the Instance name to `Cloudant-quando`
8. Choose `Create` (bottom right)

You will need to wait for the database to be started - the Status will show as `Provisioning in progress` then `Active`.  Next setup the connection...

## 2.2 Setting up a connection

**N.B. The quando app must have finished being installed.**
To create a named connection to the Cloudant database (this will be used by Quando:Cloud):

1. Open the `Resource List` (from the top left menu)
2. Click on the Service `Cloudant-quando`, i.e. the name of the (Cloudant) database service.
  - If you are reusing a Cloudant service, then choose that service instead.
3. Choose `Connections` (on the left)
4. Choose `Create Connection +` (on the right)
5. Select the previously installed App (click the empty circle on the left)
6. Choose `Next`
7. Choose `Create`
8. Wait until the offer to choose `Restage app` is shown
9.  Choose `Restage`
10. Click on the Resource list (or navigate there by the menu)
11. You should see, in Cloud Foundry apps, that the quando app is Started.
12. Click on the Name of the app.
13. Click on `Visit App URL`
14. Click on Inventor - you should see the Quando Editor.

# 3. Adding a user
You will need to do the following to add a user to your database.

1. From the `Resource List`, choose the Service `Cloudant-quando`
2. Choose `Dashboard` at the top right
3. Choose `Create Database` at top
4. Type `user` as the database name (all lower case)
5. Choose `non-partitioned`
6. Choose `Create` (bottom right)
7. At `All Documents` (top left) click the `+`, then `New Doc`
8. Replace the text editor contents with `{ "_id": "user", "password": "pass" }` - where you can replace user with a login and pass with a **currently very insecure** password.
9. Click `Create Document` (top left)
10.  Open the app URL, choose Inventor and check that login now works.
