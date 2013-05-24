---
layout: post
title: Request Tracker and Postgres Performance
---


My current employer recently switched to a new helpdesk ticketing system
called [Request Tracker](http://bestpractical.com/rt/) with [Postgres](http://www.postgresql.org/) as the data store.

Not long after the initial launch most of the application took **ten plus seconds** to render most pages.
[![](/images/no_time_for_dat_http_request.jpg)](/images/no_time_for_dat_http_request.jpg)