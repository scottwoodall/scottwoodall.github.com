---
layout: post
title: SSH Time Saver
---

If you're logging into several SSH terminals throughout your work day, here's
a quick client config change that will save you some keystrokes:

Add the following to your local '~/.ssh/config'

    
    
    Host *
    ControlPath ~/.ssh/master-%r@%h:%p
    ControlMaster auto
    

Once you've logged into a server, open another terminal and log in again to
the same server with the same username. You won't be prompted for a password
as it logs in over the existing socket that is created from your first
session. Downside, if you lose the first terminal you lose all the others.

