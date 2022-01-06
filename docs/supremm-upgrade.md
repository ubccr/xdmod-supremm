---
title: SUPReMM Open XDMoD module Upgrade Guide
---

General Upgrade Notes
---------------------

The Job Performance (SUPReMM) XDMoD module should be upgraded at the same time as the main XDMoD
software. The upgrade procedure is documented on the [XDMoD upgrade
page](https://open.xdmod.org/upgrade.html).  The ingestion and aggregation
script `aggregate_supremm.sh` **must** be run after the XDMoD software has been
upgraded.

9.5.0 to 10.0.0 Upgrade Notes
----------------------------

- This upgrade includes database schema changes.
    - Modifies `modw_supremm` schema.
    - Modifies `modw_aggregates` schema.

This upgrade adds a new dimension to the SUPReMM realm to allow filtering on
overall GPU usage and new statistics for GPU-hour weighted average GPU usage
and GPU hours.

The upgrade script `xdmod-upgrade` will modify the fact tables in the database
to add columns to store the new GPU information. After the `xdmod-upgrade` script
completes, the ingestion and aggregation script `aggregate_supremm.sh` **must**
be run. If the `aggregate_supremm.sh` script has not been run then the portal will display
an error message similar to the one below when trying to view SUPReMM realm data:
```
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'gpu_time_active' in 'where clause'
```

 Existing GPU jobs in the database will **not** automatically be re-ingested by the
upgrade scripts. So jobs that were already loaded into XDMoD will show as no GPU
information. You can force reingestion of all jobs by resetting the job
ingest status:
```
$ /usr/lib64/xdmod/xdmod-supremm-admin --action reset --resource [RESOURCE] -d
```
And then run the ingest and aggregation script:
```
$ aggregate_supremm.sh
```
