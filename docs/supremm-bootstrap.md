---
title: Initial run
---

We highly recommend manually running the various scripts in the Job Performance Data workflow
first before setting up the periodic cron jobs. We recommend using the debug options for the
scripts when running manually.

## Prerequisites

The following software components should have been installed and configured:

1. PCP running on compute nodes
1. XDMoD with the Job Performance (SUPReMM) module
1. MongoDB
1. Job Summarization software

The following data should be present:

1. XDMoD should have accounting data in the Jobs realm
1. PCP archives that contain metrics collected from compute nodes that ran jobs that are present in XDMoD

## Manual run

1. Ingest job accounting data into XDMoD
1. Run the PCP archive indexer script 

Run the indexer script:
-----------------------

The archive indexer script scans the PCP archive directory that is specified
in the configuration file, parses the PCP archive and stores the archive metadata in
the database. This index is then used by the job summarization script to quickly
obtain the list of archives for each job.

The archive indexer script by default uses archive file name to only process
archives that were created in the last N days.  The first time the archive
indexer is run, specify the "-a" flag to get it to processes all archives.  It
is also recommended to specify the debug output flag -d so that you can see
that it is processing the files:

    $ /usr/bin/indexarchives.py -a -d

Run the summarization script:
-----------------------------

    $ /usr/bin/summarize_jobs.py -d

You should see log messages indicating that the jobs are being processed. You
can hit CTRL-C to stop the process.  The jobs that have been summarized by the
script will be marked as processed in the database and the summaries should end
up in MongoDB. Check to see that the summaries are in MongoDB by, for example, using
the MongoDB command line client to query the database:

    $ mongo [MONGO CONNECTION URI]
    > var cols = db.getCollectionNames();
    > for(var i=0; i < cols.length; i++) {
          print(cols[i], db[cols[i]].count())
      }

Check Open XDMoD Portal
-----------------------

After successfully installing and configuring the SUPReMM package you
should check the Open XDMoD portal to make sure everything is working
correctly.  By default, the SUPReMM data is only available to authorized
users, so you must log into the portal.  After logging in there should
an additional tab visible named "Job Viewer".  In addition to the new
tab, the "SUPREMM" realm should be visible in the "Usage" and "Metric
Explorer" tabs.

Note that the admin user that was created in the Open XDMoD does not have a
user role by default and therefore cannot view SUPReMM data. If you login to
XDMoD using the admin user account you will see a popup dialog box with the
error message "Job Viewer: The Quick Job Lookup resource list failed to load.
(The role to which you are assigned does not have access to the information you
requested.)". If you try to select SUPReMM realm data in the Usage tab then you
should see an "access denied" message box. These messages should not be seen
when accessing the portal using a normal account that has user role.  If
desired, a user role can be added to the admin account using the "User
Management" tab in the XDMoD Dashboard.


## Troubleshooting

Pick an HPC job that:

- The accounting data for the job is present in the XDMoD datawarehouse
- There exists PCP archive data for the compute nodes on which the job ran

