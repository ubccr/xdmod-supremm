---
title: Ingest data
---

The job-level data is typically processed daily, with the various scripts run as cron jobs. The workflow is described below:

1. Accounting data are ingested into Open XDMoD using the `xdmod-shredder` and `xdmod-ingestor` commands.
1. The job summarization software runs. This software generates job-level summaries by combining the accounting data (retrieved from Open XDMoD) with the node-level performance data (collected on the compute nodes).
1. The job-level summaries are ingested into Open XMDoD and the data aggregated.

The `xdmod-shredder` and `xdmod-ingestor` commands are part of the core Open XDMoD software and are documented in the [Shredder](http://open.xdmod.org/shredder.html) and [Ingestor](http://open.xdmod.org/ingestor.html) guides.

The job summarization script is part of the SUPReMM job summarization package and is described in the [configuration](supremm-processing-configuration.html) page.

The job-level summaries are ingested into Open XDMoD with the following command:

    aggregate_supremm.sh

Cron Configuration
------------------

An example cron configuration file is shown below to illustrate a typical
setup. The actual content of the cron file will depend on whether or not the
summarization software is installed on a different host than the Open XDMoD
package. The amount of time taken to run the various scripts depends on many
factors mainly the number and size of HPC jobs and the IO bandwidth of the host
that runs the scripts.

    # Shred and ingest accounting data
    0 1 * * * root /usr/bin/xdmod-slurm-helper -q -r resource-name && /usr/bin/xdmod-ingestor -q

    # Create job level summaries
    0 2 * * * root /usr/bin/supremm_update

    # Ingest job level sumamries into XDMoD and run aggregation
    0 4 * * * root /usr/bin/aggregate_supremm.sh
