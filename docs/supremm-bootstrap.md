---
title: Initial run
---

The Job Performance data workflow is run as a series of batch processing
scripts executed periodically via cron.

Before setting up the batch processing workflow, we highly recommend manually
running the various scripts in debug mode.

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

The following steps should be performed in order:

1. Ingest job accounting data into XDMoD
1. Run the PCP archive indexer script 
1. Run the job summarization script
1. [Optional] Ingest the job batch scripts
1. Run the XDMoD ingest and aggregation script
1. Verify data in the XDMoD UI

### 1. Ingest job accounting data into XDMoD

Ensure that there is job accounting data in XDMoD that covers the time period of the PCP archives.
For example you can check the 'Number of Jobs Ended' metric in the Usage tab of the XDMoD UI
and confirm that there are jobs for the same time period as the PCP archive data.

### 2. Run the PCP archive indexer script

The archive indexer script scans the PCP archive directory, parses each PCP
archive and stores the archive metadata in the XDMoD datawarehouse. This index
is then used by the job summarization script to efficiently obtain the list of
archives for each job.

The archive indexer script uses the archive file path to estimate the
create time of each archive. The script will only process
archives created in the previous 3 days by default.  The first time the archive
indexer is run, specify the "-a" flag to get it to processes all archives.  It
is also recommended to specify the debug output flag -d so that you can see
that it is processing the files:

    $ indexarchives.py -a -d

A typical output of the script would be:

    2018-09-06T11:56:30.066 [DEBUG] Using config file /etc/supremm/config.json
    2018-09-06T11:56:30.068 [INFO] archive indexer starting
    2018-09-06T11:56:31.433 [INFO] Processed 1 of 1649 (hosttime 0.00125503540039, listdirtime 0.0011420249939, yieldtime 0.0) total 0.00125503540039 estimated completion 2018-09-06 11:56:33.501839
    2018-09-06T11:56:31.514 [DEBUG] processed archive /data/pcp-archives/hostname1.example.com/2018/09/04/20180904.00.10.index (fileio 0.067507982254, dbacins 9.67979431152e-05)
    2018-09-06T11:56:31.596 [DEBUG] processed archive /data/pcp-archives/hostname1.example.com/2018/09/05/20180905.00.10.index (fileio 0.0788278579712, dbacins 3.19480895996e-05)
    2018-09-06T11:56:31.652 [DEBUG] processed archive /data/pcp-archives/hostname1.example.com/2018/09/06/20180906.00.10.index (fileio 0.0517160892487, dbacins 3.09944152832e-05)
    ...

Verify that the output lists the PCP archives that you expect.

If you see message similar to:

    2018-08-21T05:56:27.426 [DEBUG] Ignoring archive for host "login-a" because there are no jobs in the XDMoD datawarehouse that ran on this host.

This means that the PCP archives for this host were skipped and will not be
used for job summarization. If you see the hostname for a compute node that
should have run jobs then the likely cause is that the job data was not ingested
into XDMoD. Go back ingest the job data and then rerun the `indexarchives.py -a` command again.

### 3. Run the summarization script:

The summarization script is responsible for generating the job level summary records
and inserting them in the MongoDB instance. The script reads the job information
from the XDMoD datawarehouse and processes the PCP archives. The default
behavour of the script is to process all jobs in the XDMoD datawarehouse that
have not previously been summarized. If there are no PCP archive data for
a job then a summary record is still created, but, of course, there will
be no performance metric information in the record.

    $ summarize_jobs.py -d

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

### 4. [Optional] Run the job batch script ingest

Job batch scripts are displayed in the "Job Script" tab in the "Job Viewer" in
XDMoD. This tab is only displayed if the job script is available and the absence
of the jobs scripts does not impact the rest of the interface.

The `ingest_jobscripts.py` script parses the filesystem, reads each job script file
and loads the contentss into the XDMoD datawarehouse.
If you have the batch scripts for each HPC job available, they are ingested as
follows

    $ ingest_jobscripts.py -a -d

The `ingest_jobscripts.py` has similar commandline configuration as the `indexarchives.py`. The path
is parsed to obtain the start time of the job and only the last 3 days worth of
jobs are ingested by default.


### 5. Run the XDMoD ingest and aggregation script

Once there are job summary data in MongoDB it is ingested and aggregated into
XDMoD as follows:

    $ aggregate_supremm.sh -d

### 5. Check Open XDMoD Portal

After the XDMoD ingest and aggregation script has completed sucessfully
you should log in to the portal and confirm that the data are present.

The Job Performance data is displayed in the 'SUPREMM' realm in XDMoD. There are
access controls enabled on the data as follows:

- Accounts with 'User' role may only see job performance data for jobs that they ran
- Accounts with 'Principal Investigator' role may only see job performance data for their jobs and the job that they were PI on.
- Accounts with 'Center Staff' and 'Center Director' role may see all jobs.

You should login using an account that has either 'Center Staff' or 'Center Director'
role and confirm that there is an  additional tab visible named "Job Viewer".  In addition to the new
tab, the "SUPREMM" realm should be visible in the "Usage" and "Metric
Explorer" tabs.

If there were jobs in the database then there should be data for the 'Number of Jobs Ended' metric.
If there were valid metrics then you should see data for the 'Avg CPU %: User metric'.

Note that the admin user that was created in the Open XDMoD has a 'User' role
mapped to the 'Unknown' user by default. This means that all plots of
SUPREMM realm data will show "No data abailable for the criteria specified" and
no jobs will be able to be viewed in the "Job Viewer" tab.


## Troubleshooting

Pick an HPC job that:

- The accounting data for the job is present in the XDMoD datawarehouse
- There exists PCP archive data for the compute nodes on which the job ran

