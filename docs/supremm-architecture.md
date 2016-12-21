---
title: SUPReMM architecture
---

The SUPReMM architecture comprises three major components.

* Software that runs directly on HPC compute nodes and periodically collects performance information.
* Software that uses the node-level performance data to generate job-level data.
* An Open XDMoD module that enables the job-level information to be viewed and analysed.

The SUPReMM architecture is modular and may be extended to support multiple
different data collection packages. This document describes the steps necessary
to setup the SUPReMM system using the open-source Performance Co-Pilot (PCP)
software as the primary data source. For more information about other data
sources please contact the development team via the mailing list or email
(contact details on the [main overview page](http://open.xdmod.org))

The SUPReMM architecture does not depend on a specific HPC resource manager, but
there are resource manager-specific configuration steps and resource
manager-specific data processing plugins. This release has been tested with the
SLURM resource manager and the documentation describes how to configure with
SLURM.

A simplified high-level overview of the SUPReMM dataflow is shown in Figure 1.
below.  This diagram shows the principal features of the collection and
processing architecture. The data aggregation and display components present in
Open XDMoD are not shown.

![Dataflow diagram for SUPReMM]({{ site.baseurl }}/assets/images/SUPReMM_DFD.svg "SUPReMM data flow diagram")
*Figure 1. SUPReMM data flow diagram*

### Typical install locations

* **HPC Compute Nodes** have the PCP data collection software installed on
  them. The collection software is configured to collect metrics from the nodes
  periodically and whenever an HPC job starts or ends. The
  data are typically logged to shared storage.
* **Dedicated web server** has the Open XDMoD software and SUPReMM Open XDMoD module installed.
* **Dedicated MySQL server** hosts a MySQL instance containing the Open XDMoD datawarehouse.
* **Dedicated SUPReMM server** has the SUPReMM job summarization
  software and  MongoDB document database installed. This server requires read
  access to the node-level PCP archives generated on the compute nodes and access
  to the Open XDMoD datawarehouse MySQL database.
