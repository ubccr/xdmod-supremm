---
title: Ingest data
---

The job-level data is typically processed daily, with the various scripts run as cron jobs. The workflow is described below:

1. Accounting data are ingested into Open XDMoD using the `xdmod-shredder` and `xdmod-ingestor` commands.
1. The job summarization software runs. This software generates job-level summaries by combining the accounting data (retrieved from Open XDMoD) with the node-level performance data (collected on the compute nodes).
1. The job-level summaries are ingested into Open XMDoD and the data aggregated.

The `xdmod-shredder` and `xdmod-ingestor` commands are part of the core Open XDMoD software and are documented in the [Shredder](http://open.xdmod.org/shredder.html) and [Ingestor](http://open.xdmod.org/ingestor.html) guides.

## Prerequisites

Before setting up the batch processing workflow, we highly recommend manually running the various scripts in debug mode following
the instructions on the [Inital Ingest Setup](supremm-bootstrap.md) page.

Deploy SUPReMM in Production
--------------------------------

Enable the following script to run everyday via a cron job.  It should be executed
after the Open XDMoD daily update process is expected to finish.

    $ /usr/bin/supremm_update

This script calls `indexarchives.py` and `summarize_jobs.py` in turn while providing a
locking mechanisms so that processes do not conflict with each other. This script (and
all data processing commands) should be run under an unprivileged user account.
Typically the `xdmod` user account is used.

The job-level summaries are ingested into Open XDMoD with the following command that
must be run by the `xdmod` user:

    $ aggregate_supremm.sh

Cron Configuration
------------------

An example cron configuration file is shown below to illustrate a typical
setup. The actual content of the cron file will depend on whether or not the
summarization software is installed on a different host than the Open XDMoD
package. The amount of time taken to run the various scripts depends on many
factors mainly the number and size of HPC jobs and the IO bandwidth of the host
that runs the scripts.

    # Shred and ingest accounting data
    0 1 * * * xdmod /usr/bin/xdmod-slurm-helper -q -r resource-name && /usr/bin/xdmod-ingestor -q

    # Create job level summaries
    0 2 * * * xdmod /usr/bin/supremm_update

    # Ingest job level sumamries into XDMoD and run aggregation
    0 4 * * * xdmod /usr/bin/aggregate_supremm.sh

By default, the `aggregate_supremm.sh` runs an SQL `ANALYSE TABLE` command after the
aggregation. This helps the load performance of plots in the XDMoD portal.
When there are large amounts of data in the SUPREMM realm (10s or 100s of millions of jobs)
 the `ANALYSE TABLE` step can take a long time to run. The `-a` option to the
script is used to selectively disable the analyse step. For large databases
the analyse tables step need only be run weekly. This reduces the aggregation
time without adversely impacting overall portal load performance.

The following `crontab` configuration could be used to run the analyse table step
once a week.

    0 4 * * 1-6 xdmod /usr/bin/aggregate_supremm.sh -a false
    0 4 * * 0   xdmod /usr/bin/aggregate_supremm.sh
