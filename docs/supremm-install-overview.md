This page gives an overview of the steps to install
the various software components needed to enable Job Performance 
data in XDMoD. Instructions for upgrading the software from are available
on the [upgrade page](supremm-upgrade-overview.md)

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

1. Install performance data collection software on the compute nodes. Choose
   either Performance Co-Pilot (PCP) or Prometheus.

   [Instructions for Performance Co-Pilot](supremm-install-pcp.html)

    **OR**

   [Instuctions for Prometheus](supremm-install-prometheus.html)
1. Install [MongoDB document database](supremm-mongo.html) to store job-level performance data.
1. Install and configure the [Job Performance module](supremm-install.html) on an existing XDMoD instance.
1. Install and configure the [Job Summarization](supremm-processing-install.html) software.
1. Run the [Job Summarization and Data Ingestion](supremm-ingestor.html) processes.

It is important that the various software components are installed and configured in the
order listed. For example, if the XDMoD module is not installed and configured then the summarization software
will not be able to access the tables in XDMoD datawarehouse that are needed.

Software Compatibility
----------------------

The Job Performance (SUPReMM) XDMoD module version number must be
identical to the version of the base XDMoD install. The versions of the 
summarization software and PCP software for a given XDMoD version are listed
below.

### Open XDMoD {{ page.sw_version }}

Centos 7 Operating System

<table>
<thead>
<tr>
<th>Package</th> <th>Recommended Version</th> <th>Compatible Version(s)</th>
</tr>
</thead>
<tbody>
<tr>
<td> Job Summarization </td><td align="right"> 1.4.1 </td><td align="right"> 1.4.1, 1.2.x, 1.1.x </td>
</tr>
<tr>
<td> PCP               </td><td align="right"> 4.1.0 or 4.3.2 </td><td align="right"> 4.x </td>
</tr>
</tbody>
</table>
<br />

Rocky 8 Operating System

<table>
<thead>
<tr>
<th>Package</th> <th>Recommended Version</th> <th>Compatible Version(s)</th>
</tr>
</thead>
<tbody>
<tr>
<td> Job Summarization </td><td align="right"> {{ page.summ_sw_version }} </td><td align="right"> 2.0.0 </td>
</tr>
<tr>
<td> PCP               </td><td align="right"> 5.3.7             </td><td align="right"> 5.3.x </td>
</tr>
</tbody>
</table>
<br />

The SUPReMM software has been tested with MongoDB versions 3.4.15, 4.4, and 6.0. We expect
that the software is compatible with any supported release version of MongoDB.

The summarization software is tested against the PCP versions shipped with Centos
7.6, Centos 7.7, and Rocky 8.

System Requirements
---------------------

The detailed list of software packages for each subsystem is listed in the
respective system requirements pages.

### Hardware requirements

The XDMoD Job Performance (SUPReMM) module must be installed on an existing, functional XDMoD instance.

Compute node data collection software must be installed on the existing HPC compute nodes:
- If using PCP then the Performance Metrics Collector Daemon (pmcd) and various Performance Metrics Domain Agents (PMDAs)
should be installed on the compute nodes. 
- If using Prometheus then Prometheus exporters should be installed on the compute nodes.

If using Prometheus as the data collection software then a main Prometheus server must be setup.
For small installations this may be installed on the same server as the XDMoD instance.  However, for
best performance, it is recommended that a dedicated server is used to store the Prometheus time series data.

The Job summarization software and Mongo database may be installed on the same server as the XDMoD instance.  However, for
best performance, it is recommended that a dedicated server is used to host
the Mongo database. This server can also be used to run the Job summarization software.

We do not recommend installing databases or webservers on any HPC compute nodes.

### Storage requirements

The amount of data storage depends on the amount of historical data that is desired to be stored.

The following estimates are based on using the default configuration:

  * PCP data: 70 MB per node per day (stored as files on the network filesystem)
  * Prometheus data: TODO MB per node per day (stored in Prometheus's timeseries database)
  * Job level summary records: 36 KB per job (stored in MongoDB)
  * XDMoD datawarehouse: 2 KB per job (stored in MySQL)

These estimates were obtained from the average storage usage for the SUPReMM
system installed on the HPC resource at CCR Buffalo. The actual quantity of
data storage required depends on many factors including the rate of job
creation and which metrics are collected.

### Typical install locations

**PCP:**
* **HPC Compute Nodes** have the PCP data collection software installed on
  them. The collection software is configured to collect metrics from the nodes
  periodically and whenever an HPC job starts or ends. The
  data are logged to shared storage such as a parallel filesystem or a network attached storage device.

**Prometheus:**
* **HPC Compute Nodes** have the Prometheus exporters installed on them. These exporters expose
  information about the compute nodes that are scraped by Prometheus over the network.
* **Dedicated Prometheus server** scrapes the exporters running on the compute nodes. The Prometheus
  instance is configured to scrape metrics from these exporters on a configured interval. The data
  are logged to Prometheus's internal timeseries database.

**Both:**
* **Dedicated web server** has the XDMoD software and Job Performance (SUPReMM) XDMoD module installed.
* **Dedicated MySQL server** hosts a MySQL instance containing the XDMoD datawarehouse.
* **Dedicated SUPReMM server** has the SUPReMM job summarization
  software and  MongoDB document database installed. This server requires either read
  access to the node-level PCP archives generated on the compute nodes or to an instance of Prometheus that
  is monitoring the compute nodes. Access to the Open XDMoD datawarehouse MySQL database from this server
  is also necessary.
