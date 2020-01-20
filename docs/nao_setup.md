Draft - Nao Robot Setup

_N.B. Most of these instructions will setup a Nao robot for use **without** Cloud access._

# Ethernet based

**You will need to do this at least once for a router to setup the Nao**

The PC and Nao should be plugged in/accessing the same network, preferably by connecting the Nao direct to the PC with an ethernet cable.  _An alternative is to connect the Nao to Router through ethernet, and the PC connected to the router through wireless (or ethernet)._

When the Nao has booted, you can now:

- If using a router, discover the Nao IP address, e.g. through the Network table.
- iOtherwise, you can press the chest button briefly (do not hold the chest button in - that will shut it down). The Nao will read out it's IP address, e.g. 192.168.1.77.  If it doesn't it may need a bit more time, or the volume may be too low.

On a PC, open the IP address in a browser, e.g. http://192.168.1.77.

You will be asked for the username and password, which should be nao/nao unless they have been changed.

A menu should show you battery charge status, etc, **and allow you to change to the volume**.  This confirms that you have access to the Nao.

You can now use this IP address directly in Quando - through the Connect Robot IP block.

## Wireless router setup

Following on from the above, in the menu, choose the second big icon - wireless settings.

You should see your router wifi name - click on it and enter the password.

Assuming this works, disconnect the ethernet cable, and press the chest button - the IP address will have changed.  _You may also be able to find the Nao IP address through the router._  You will also have to login again.

N.B. The wireless IP address will usually change every time you startup the Nao.

### Fixing the IP address for a router - not proven to work consistently

**Warning - this worked once and then the router wouldn't allow fixing the IP address afterwards.  This may be because the Wifi mode was changed to increase reliability.**

These details have been left in case they are useful.

The IP address will be the same for the session - which is useually until the Nao is shut down.  This does mean entering/choosing an IP address every time you use it.  This is not just tedious, but also a big issue if you have multiple Nao robots.

You can set the IP address for a specific Nao in the router.

1. Find the IP address of the router from your PC (e.g. in windows, run 'ipconfig' in a command line - you are looking for the 'Default Gateway' for the Wifi/Ethernet). e.g. 192.168.1.254
2. Open the IP address, e.g. http://192.168.1.254 in a browser.
3. The following is for a BT Smart hub router - you may need different instructions:

    1. Choose the Advanced Settings->My Network->Address table (you will need to enter the admin password).
    2. Click on the (currently active) address for the Nao robot (you may need to compare the mac address, or only set one Nao at a time).
    3. Change 'Always use the Address' to YES
    4. (optional - if you know what you're doing) You may Click on the IP address - and change it to an IP address in the server range, e.g. 192.168.1.77.  You will liekly need to reboot the Router and the Nao for the new IP address to be used.
    5. Save

4. You should now be able to reboot the router and Nao - the Nao should be at the fixed IP address every time.

## PC accessing the internet and the Nao

This can be fairly easily done by the above setup - so the Nao is accessing the router by wireless (or ethernet), then:

- Either use Wifi from the PC to access the internet (as usual) and plug an ethernet cable from the router to the PC.
- Or plug the PC into ethernet for internet and access the router through wifi (as previous).

## Nao accessing internet (e.g. for updates).

This can be done (not tested at this time) by:

1. Connect Nao and PC to Router.
2. Setup Nao from PC to access the internet through Wifi. **N.B. This will store your login detaisl on the Nao - so may not be secure**
3. Press the chest button to find the Nao's temporary IP address - then access the IP address through the PC browser.

## Using a PC with internet access as a Mobile Hotspot (Wireless Access Point)

This is now being avoided, since it was unreliable.
