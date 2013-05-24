---
layout: post
title: Request Tracker and Postgres Performance
---


At work we recently switched to a new helpdesk ticketing system
called [Request Tracker](http://bestpractical.com/rt/) with [Postgres 9.2](http://www.postgresql.org/) as the data store.

Not long after launch the application was taking **ten plus seconds** to render most pages. In an organization with thousands of people using the site, that adds up to a metric ton of productivity left on the table and people hating on the application.
[![](/static/images/no_time_for_dat_http_request.jpg)](/static/images/no_time_for_dat_http_request.jpg)

So where to begin? I’m not familiar with the Request Tracker code base so lets roll with the old adage of “don’t optimize prematurely” and figure out what is going before making any changes.

    challenge accepted

I began by hooking [Devel::NYTProf](http://search.cpan.org/~timb/Devel-NYTProf-5.03/lib/Devel/NYTProf.pm) into our development instance of the application to get a profile of what was going on. An environment variable is needed so we can exit out of the process and still have NYTProf write all its information to the output file.

    $ export NYTPROF=sigexit=1
    $ perl -d:NYTProf /opt/rt/sbin/standalone_httpd --port 8080
    
Then in my browser I requested a known slow page, waited for it to finish then hit Ctrl-C to terminate the perl process and generate our fancy pants html page.

    $ nytprofhtml nytprof.out
    
[![](/static/images/nytprof_request_tracker.jpg)](/static/images/nytprof_request_tracker.jpg)

Oh snap!! We spent 10.3 seconds inside “DBI::st::execute”, beginning to sound like Postgres is not happy.

[![](/static/images/you_dont_say.jpg)](/static/images/you_dont_say.jpg)

We’re off to Postgres, land of the mighty elephant, slayer of dolphins. Let’s configure it so that any query over 200ms gets logged.
    
    # postgresql.conf
    log_min_duration_statement = 200
    
    # signal postgres to pick up the new changes
    pg_ctl reload

I refreshed my browser and saw an uzi’s worth of queries zing by and this one caught my attention:
     
    May 24 11:18:26 awesome-server postgres[25431]: [611-1] LOG:  duration 573.763 ms  execute dbdpg_p18659_56038: SELECT  * FROM Groups WHERE Instance = $1 AND LOWER(Domain) = LOWER($2) AND LOWER(Type) = LOWER($3)
     
    May 24 11:18:26 awesome-server postgres[25431]: [611-2] DETAIL:  parameters: $1 = '13', $2 = 'RT::Ticket-Role', $3 = ‘Requestor’
  
Whoa, whoa whoa, hold the phone. 573ms for a query I saw multiple times on **a single page load.** Will the real “EXPLAIN ANALYZE” please stand up!?

    rtyoyo=# explain analyze SELECT  * FROM Groups WHERE Instance = 13 AND LOWER(Domain) = LOWER('RT::Ticket-Role') AND LOWER(Type) = LOWER('Requestor');
    
    QUERY PLAN
    -----------------------------------------------------------------
    Seq Scan on groups  (cost=0.00..66511.03 rows=1 width=88) (actual time=573.605..573.626 rows=1 loops=1)
    Filter: ((instance = 13) AND (lower((domain)::text) = 'rt::ticket-role'::text) AND (lower((type)::text) = 'requestor'::text))
    Rows Removed by Filter: 1887999
    Total runtime: 573.763 ms
    (4 rows)
    
Well hello there Mr. Sequence Scan and your mistress Rows Removed by Filter. Time to blow this party up with an index.

    rtyoyo=# create index concurrently idx_groups_instance_domain_ticketrole_type_requestor on Groups(Instance) where LOWER(Domain) = LOWER('RT::Ticket-Role') AND LOWER(Type) = LOWER('Requestor');
    
 And rerun our “EXPLAIN ANALYZE” to see how much of a difference we made:
     
    rtyoyo=# explain analyze SELECT  * FROM Groups WHERE Instance = 13 AND LOWER(Domain) = LOWER('RT::Ticket-Role') AND LOWER(Type) = LOWER('Requestor');

    QUERY PLAN
    -----------------------------------------------------------------
    Index Scan using idx_groups_instance_domain_ticketrole_type_requestor on groups
    (cost=0.00..8.33 rows=1 width=88) (actual time=0.035..0.036 rows=1 loops=1)
    Index Cond: (instance = 1006089)
    Total runtime: 0.076 ms

[![](/static/images/obama_not_bad.jpg)](/static/images/obama_not_bad.jpg)

I repeated this process for four additional queries relating to the Groups table and a few minutes later I started getting IM’s from co-workers:

    “Jeeze. Everything just ZINGs.”
    “I was just about to take UP smoking just to have something to kill the time.”

Page loads were now sub 1 second and my job was done.

[![](/static/images/blow_up.gif)](/static/images/blow_up.gif)
