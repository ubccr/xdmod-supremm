---
title: SUPReMM installation overview
---

Install overview
----------------

After upgrading to Open XDMoD 6.0 or higher and ensuring that it is working properly, enabling SUPReMM requires several steps:

1. Install a [SUPReMM data collection framework](supremm-compute.html) on the HPC compute nodes.
1. Install [MongoDB document database](supremm-mongo.html) to store job-level performance data.
1. Install and configure the [SUPReMM Open XDMoD module](supremm-install.html).
1. Install and configure the [SUPReMM Job Summarization framework](supremm-processing-install.html).
1. Run the [SUPReMM Job Summarization and Data Ingestion](supremm-ingestor.html) processes.

It is recommended that these steps be performed in the order listed.

System Requirements
---------------------

The detailed list of software packages for each subsystem is listed in the
respective system requirements pages.

### Hardware requirements

The Open XDMoD SUPReMM module should be installed on the existing Open XDMoD system.

The PCP data collection software should be installed on the existing HPC compute nodes.

The SUPReMM job-level summarization software and SUPReMM document store server
may be installed on the same machine as the Open XDMoD software.  However, for
best performance, it is recommended that a dedicated machine is used to host
the document store server that contains the job summary documents. This machine
can also be used to run the job-level summarization software.

We do not recommend installing databases or webservers on any HPC compute nodes.

### Storage requirements

The amount of data storage depends on the amount of historical data that is desired to be stored.

The following estimates are based on using the default configuration:

  * Raw node level metrics: 70 MB per node per day (stored as files on the network filesystem)
  * Job level summary records: 36 KB per job (stored in MongoDB)
  * XDMoD datawarehouse: 2 KB per job (stored in MySQL)

These estimates were obtained from the average storage usage for the SUPReMM
system installed on the HPC resource at CCR Buffalo. The actual quantity of
data storage required depends on many factors including the rate of job
creation and which metrics are collected.
