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

8.5.1 to 9.0.0 Upgrade Notes
----------------------------

This upgrade fixes an issue with the job efficiency categorization. This issue
did not affect any functionality in the 8.5 release, but resulted in incorrect
values stored in the datawarehouse aggregate tables. These values are used by
the new drill down function for Job Efficiency dashboard component and so must
be updated to the correct values. If this reaggregation step is not run then
the list of jobs in  the drilldown could include jobs that are not categorized
as inefficient.

After the XDMoD upgrade procedure has completed the following command should
be run:
```bash
/usr/share/xdmod/tools/etl/etl_overseer.php --last-modified-start-date 2000-01-01 -p jobefficiency.aggregation -p jobefficiency.joblist
```

This will reaggregate all job efficiency data.
