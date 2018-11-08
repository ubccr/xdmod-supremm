---
title: SUPReMM Open XDMoD module Upgrade Guide
---

General Upgrade Notes
---------------------

The Job Performance (SUPReMM) XDMoD module should be upgraded at the same time as the main XDMoD
software. The upgrade procedure is documented on the [XDMoD upgrade
page](https://open.xdmod.org/upgrade.html).

**NOTE:** the recommended MySQL/MariaDB database settings have changed and must be updated. See 
the [XDMoD Software Requirements](https://open.xdmod.org/8.0/software-requirements.html#mysql) for 
details.

7.5.1 to 8.0.0 Upgrade Notes
----------------------------

- This upgrade includes database schema changes.
    - Modifies `modw_supremm` schema.
    - Modifies `modw_aggregates` schema.

The `modw_supremm.batchscripts` table is deprecated and is replaced by the `modw_supremm.job_scripts` table.
The contents of the `batchscripts` table are migrated to the `job_scripts` table by
the `xdmod-upgrade` script. The `batchscripts` table is not deleted automatically, but can be safely
dropped from the database after a successful upgrade.

The `modw_supremm.jobstatus` table was used to track the aggregation status of each row
in the `modw_supremm.job` table. The `jobstatus` table is not longer used and is removed 
by the upgrade. The `modw_supremm.job` table now has an extra column that stores the modification
time for each row.

The modifications to the `modw_aggregates` schema are made by the aggregation software. These run
automatically the first time `aggregate_supremm.sh` runs after the upgrade.
