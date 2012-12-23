---
layout: post
title: What's using all the disk space on my unix file system?
---

Have you ever logged into a unix server to see a file system at 100%? Here's a
quick and dirty way to track down what file or directory is using up all the
space.

This command should work across the different Linux vendors (Redhat, Debian,
Ubuntu, SuSE etc.) but will probably have to be tweaked for AIX, Solaris and
HPUX as their versions of 'du' are different and don't respect the same flags.

This will print the top ten largest directories, starting from your '$PWD'.
The '.[a-zA-Z]*' makes sure to capture hidden files and directories.

    
    
    scott@linux$ du -cks * .[a-zA-Z]* | sort -rn | head -11
    362716 total
    235632 lib
    49252 cache
    49232 www
    16720 www.tar.gz
    7776 log
    3788 backups
    164 spool
    104 run
    24 mail
    8 tmp
    

  
You can then continue to 'cd' into the top directory listed and issue a '!du'
command to keep drilling down until you find the root cause of your problem.
The '!' prefix before 'du' says to execute the last 'du' command with all of
the same parameters.

