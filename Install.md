# Installing to run locally and for developers

See https://code.visualstudio.com/docs/java/java-tutorial or:

### Install OpenJDK

_Note: This avoids agreeing to Oracle's commercial license._

This may be unnecessary if you alreday have Java installed.

Open https://adoptopenjdk.net/ and choose the latest LTS version, e.g. 'OpenJDK 11 (latest)' and Choose the 'Hotspot JVM'.  Then download the 'latest release' - this should select the current os (confirmed for Windows 10 64 bit).  This downloads an msi installer, e.g. 'OpenJDK11U-jdk_x64_windows_hotspot_11.0.7_10.msi', which you can just click to open.

In the installer, accept and next until Custom Setup, then also select 'set JAVA_HOME' option to be 'installed on the local drive'.  Then next, Install, etc.  If it appears to have hung, check that you have accepted permission for the installer to run.

# Installing for Developers

## Install developer software

Install VSCode, Git and NodeJS.  Then

## Install Microsoft Java Extension Pack

This can be downloaded from https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack
 or found in VSCode

Install Eclipse from https://www.eclipse.org/downloads/ version 2020-03, Download 64 bit (tested for Windows 10).

If Eclipse doesn't install, then you need a Java runtime.  You can install Oracle's version (which is linked from the Eclipse 'install failed' page), or you can:

## Continuing Eclipse installation

Choose Eclipse IDE for Java Developers (the top option), then the standard options.

