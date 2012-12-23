---
layout: post
title: Django With An Oracle Backend
---


I'm a long time PostgreSQL user and due to business/security requirements am having to use Oracle as a Django backend. This post is a place for me to keep notes when dealing with Oracle. These notes are specific to a Linux environment running Redhat Enterprise 6. The application and database servers are separate hosts.
  
1. Must install [Oracle Instant Client Package - Basic, Instant Client SDK and Instant Client Package - SQL Plus](http://www.oracle.com/technetwork/topics/linuxx86-64soft-092277.html) and setup some environment variables. The SDK package needs to be extracted into $ORACLE_HOME so when building cx_Oracle via pip it can find the Oracle include directory.

 		> export ORACLE_HOME=/usr/lib/oracle/11.2/client64
		> export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$ORACLE_HOME/lib
		> export PATH=$PATH:$ORACLE_HOME/bin 

2. Manually create some directories and files to contain the Oracle connection information

	    > mkdir -p $ORACLE_HOME/network/admin
	    > vi $ORACLE_HOME/network/admin/tnsnames.ora 
3. Create a symbolic link for an Oracle shared library
    
        > cd $ORACLE_HOME/lib
        > ln -s libclntsh.so.11.1 libclntsh.so

4. Cannot use `.distinct('field name')` in ORM queries, [PostgreSQL is the only backend that does support this feature](https://docs.djangoproject.com/en/dev/ref/models/querysets/#django.db.models.query.QuerySet.distinct), but you can use `.distinct()`.

5. South support for Oracle is alpha:

	> UserWarning: ! WARNING: South's Oracle support is still alpha. Be wary of possible bugs. warn("! WARNING: South's Oracle support is still alpha. "
	
6. Noticeably fewer search results when having to troubleshoot issues.

7. Oracle will not allow you have to have a table with zero columns. Probably not something to worry about in production, but during development and using South, it becomes a burden.

        > FATAL ERROR - The following SQL query failed: ALTER TABLE "SILLY_TABLE" DROP COLUMN "ID";  The error was: ORA-12983: cannot drop all columns in a table 
        
8. SQLPLUS is a disaster of a CLI tool.  The default formatting of query results is atrocious. I can't do something crazy like hit the up arrow and run the previous query. While I imagine there are configurations to improve this, I don't feel like hunting them down. I've resulted to SQL Developer for now.
