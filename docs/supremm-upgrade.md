---
title: SUPReMM Open XDMoD module Upgrade Guide
---

General Upgrade Notes
---------------------

The Job Performance (SUPReMM) XDMoD module should be upgraded at the same time as the main XDMoD
software. The upgrade procedure is documented on the [XDMoD upgrade
page](https://open.xdmod.org/upgrade.html).
After the XDMoD software has been upgraded the ingestion and
aggregation script `aggregate_supremm.sh` **must** be run.

8.1.0 to 8.5.0 Upgrade Notes
----------------------------

- This upgrade includes database schema changes.
    - Modifies `modw_supremm` schema.

The `modw_supremm.job` and `modw_supremm.job_error` table have extra columns to store metrics
about job I/O. These columns are added to the tables by the upgrade script.

See the [Configuration Guide](supremm-configuration.md#supremm_resourcesjson) for information
about how to define the data mapping for the new I/O metrics.

Changes to the mapping only affect job metrics ingested after the configuration file
is modified. The metrics for jobs that have already been ingested are not automatically
updated. To update the data for existing jobs it is necessary to reset the job ingest
status and then run the ingest and aggregation script.

**If you do not update the data mapping then you do not need to perform the reset step (1)
but the aggregation script in step (2) must always be run after an upgrade**

Resetting the job ingest status and re-ingesting the data is done as follows:

1) Reset the job ingest status for all jobs on each HPC resource:

    $ /usr/lib64/xdmod/xdmod-supremm-admin --action reset --resource [RESOURCE] -d

The amount of time this script takes depends on the number of jobs. In a test
run for a resource that had approximately 2 million jobs it took approximately
20 minutes to reset the status.

2) Run the ingest and aggregation script:

    $ aggregate_supremm.sh

### Troubleshooting

The `aggregate_supremm.sh` script has to be run after the upgrade script is run.
If the aggregate script is not run then the error
```
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'jf.netdir_util_write' in 'where clause'
```
will be displayed in the XDMoD Usage tab and Metric Explorer tabs when trying to plot
data for the SUPREMM realm.
