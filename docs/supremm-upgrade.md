---
title: SUPReMM Open XDMoD module Upgrade Guide
---

General Upgrade Notes
---------------------

The Job Performance (SUPReMM) XDMoD module should be upgraded at the same time as the main XDMoD
software. The upgrade procedure is documented on the [XDMoD upgrade
page](https://open.xdmod.org/upgrade.html).

8.0.0 to 8.1.0 Upgrade Notes
----------------------------

- This upgrade includes database schema changes.
    - Modifies `modw_supremm` schema.

The `modw_supremm.job` and `modw_supremm.job_error` table have extra columns to store the job
energy metrics. These columns are added to the tables by the upgrade script.

The `modw_suprem.jobhosts` table stores information about the compute nodes for each job. Prior
to 8.1.0 this table used the job identifier provided by the resource manager as a unique identifier.
This data stored in this table is used to determine whether a job shared compute node with
any other job. The consequence of this design is that the shared jobs and job peers data in XDMoD
would be incorrect if the resource manager re-used job identifiers. This has been observed when
the job identifier counter on the resource manager wraps around. This update adds the job's end time
to the unique constraint and populates it based on the existing information in the datawarehouse.

No further action is required if any of the following apply:
- The HPC resources are not configured to allow HPC jobs to share compute nodes
- The shared jobs flag is set to false for a resource
- The HPC resource manager job identifier is unique

However, if there is data for an HPC resource that has non-unique job identifiers and shared
compute nodes then it will be necessary to re-ingest the job data to get correct information
into the database. This is done as follows:

First the existing data for the resource must be removed from the database using the following
command:

    $ /usr/lib64/xdmod/xdmod-supremm-admin --action truncate --resource [RESOURCE] -d

The amount of time this script takes depends on the number of jobs that have
information in the database and the performance of the MongoDB and MySQL
databases. In a test run for a resource that had approximately 2 million jobs it took
approximately 20 minutes to reset the status in MongoDB and 10 minutes to delete the
records from the MySQL database tables.

Then the job data should be re-ingested:

    $ cd /usr/share/xdmod/etl/js
    $ node etl.cluster.js --dataset=[RESOURCE]

Then the shared jobs script should be run to reprocess all jobs for the resource:

    $ /usr/lib64/xdmod/supremm_sharedjobs.php --resource [RESOURCE] -a

Finally the aggregation step should be run:

    $ aggregate_supremm.sh

The debug flag `-d` may also be specified if you wish to track the progress of the 
scripts.
