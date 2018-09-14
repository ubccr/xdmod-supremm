---
title: SUPReMM installation overview
---

Prerequisites
----------------

The Job Performance (SUPReMM) XDMoD module should be installed on an existing XDMoD
instance.  The XDMoD instance must have job accounting data shredded and
ingested and present in the UI. Do not begin the install procedure until the
accounting data is loaded into XDMoD.  See the [main XDMoD
documentation](https://open.xdmod.org) for instructions on installing and
configuring XDMoD.

Overview
----------

The steps to install and configure the software are as follows:

1. Install [Data collection software](supremm-compute.html) on the HPC compute nodes.
1. Install [MongoDB document database](supremm-mongo.html) to store job-level performance data.
1. Install and configure the [Job Performance module](supremm-install.html) on an existing XDMoD instance.
1. Install and configure the [Job Summarization software](supremm-processing-install.html).
1. Run the [Job Summarization and Data Ingestion](supremm-ingestor.html) processes.

It is important that the various software components are installed and configured in the
order listed. For example, if the XDMoD module is not installed and configured then the summarization software
will not be able to access the tables in XDMoD datawarehouse that are needed.

System Requirements
---------------------

The detailed list of software packages for each subsystem is listed in the
respective system requirements pages.

### Hardware requirements

The XDMoD Job Performance (SUPReMM) module must be installed on an existing, functional XDMoD instance.

The PCP data collection software must be installed on the existing HPC compute nodes.

The Job summarization software and Mongo database may be installed on the same server as the XDMoD instance.  However, for
best performance, it is recommended that a dedicated server is used to host
the Mongo database. This server can also be used to run the Job summarization software.

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

### Typical install locations

* **HPC Compute Nodes** have the PCP data collection software installed on
  them. The collection software is configured to collect metrics from the nodes
  periodically and whenever an HPC job starts or ends. The
  data are logged to shared storage such as a parallel filesystem or a network attached storage device.
* **Dedicated web server** has the XDMoD software and Job performance (SUPReMM) XDMoD module installed.
* **Dedicated MySQL server** hosts a MySQL instance containing the XDMoD datawarehouse.
* **Dedicated SUPReMM server** has the SUPReMM job summarization
  software and  MongoDB document database installed. This server requires read
  access to the node-level PCP archives generated on the compute nodes and access
  to the Open XDMoD datawarehouse MySQL database.
