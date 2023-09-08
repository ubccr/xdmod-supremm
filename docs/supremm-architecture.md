
Job performance data in XDMoD is obtained from collection software running on
the compute nodes of the HPC resource.  The software architecture comprises three major components.

* Software that runs directly on HPC compute nodes and periodically collects performance information.
* Job summarization software that uses the node-level performance data to generate job-level data.
* An XDMoD module that enables the job-level information to be viewed and analysed in XDMoD.

The job-level summary records are stored in a MongoDB document database.

The Job Performance (SUPReMM) module in XDMoD may be extended to support multiple
different data collection packages. The XDMoD team recommends
using either Performance Co-Pilot (PCP) or Prometheus as the data source for new software installs. This document assumes that either
PCP or Prometheus is used as the data source. For more information about other data
sources please contact the development team via the mailing list or email
(contact details on the [main overview page](http://open.xdmod.org)).

A simplified high-level overview of the SUPReMM dataflow is shown in Figure 1.
below.  This diagram shows the principal features of the collection and
processing architecture. The data aggregation and display components present in
Open XDMoD are not shown.

![Dataflow diagram for SUPReMM]({{ site.baseurl }}/assets/images/SUPReMM_DFD.svg "SUPReMM data flow diagram")
*Figure 1. SUPReMM data flow diagram*

The data collection software running on the compute nodes provides the node-level
performance mmetrics. This guide provides instructions for using either
Performance Co-Pilot (PCP) or Prometheus as the data collection software. Metric
data is configured to be logged every 30 seconds (and optionally also at the
start and end of each compute job via hooks in the job prolog and epilog scripts).

The node-level performance data is stored in a central location for subsequent
processing by the summarization software. For PCP, the data are stored as
PCP archive files on a shared filesystem. For Prometheus, the data are
are stored in Prometheus's timeseries database.

The accounting logs from the resource manager (such as Slurm SGE, PBS, LSF, etc) are ingested into the XDMoD datawarehouse.
These accounting logs include information about the start and end times of each compute job
as well as the compute nodes that were assigned to the job.

The summarization software runs periodically via cron. The software uses the
accounting information from the XDMoD datawarehouse and the information from the data
collection software to generate a job-level summary for each HPC job. These job-level
summaries are stored in a MongoDB document database.

The summarized job data is then ingested into the XDMoD datawarehouse for display
in the web-based user interface and analysis using XDMoD's Data analytic tools.
