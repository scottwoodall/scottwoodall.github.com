---
layout: post
title: Using screen to install software or apply patches remotely
---

Having to install software or apply patches from home is convenient, saving
you from driving into the office. It does come with a bit of extra risk in
that if your VPN connection dies midway through the install you're probably
going to find a mess when you get reconnected. Enter
[screen](http://www.gnu.org/software/screen/). This isn't going to document
how to get screen installed, use your OS package manager for that.

Screen is a terminal multiplexer and if you use it in the following way you
won't ever have to worry about your upgrade failing due to a flaky internet or
VPN connection. Having a ssh connection open just issue the following:

    
    
    scott@linux:~$ screen
    

  
It will look like as if nothing happened but really you are now sitting at a
virtual terminal. You can perform the install/upgrade within this terminal and
if anything happens to your internet connection you can relax knowing that
you'll just be able to reconnect to your screen session that's still running.
To disconnect from a screen issue the following from within your virtual
terminal:

    
     ctrl-a ctrl-d 

  
To see a list of screen sessions that you can connect to:

    
    
    scott@linux:~$ screen -list There are screens on:
    1331.pts-3.scott-woodall (12/23/2010 09:46:15 PM) (Detached) 1
    Sockets in /var/run/screen/S-scott.
    scott@linux:~$
    

  
Then to reconnect to an existing screen virtual terminal:

    
     scott@linux:~$ screen -r 1331.pts-3.scott-woodall 

  
There are several other useful scenarios (viewing an ssh session while someone
else is driving) but this one definitely saves a lot of worry while working
from home.

