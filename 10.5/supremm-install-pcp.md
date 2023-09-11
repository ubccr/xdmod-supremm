**These instructions only apply to resources that will use PCP software. Installation instructions for Prometheus are [here](supremm-install-prometheus.md).**

The PCP software should be installed on each compute node and configured so
that data are collected:

* At the start of every job
* 10, 20 and 30 seconds after job start
* Periodically during the job (recommended 30 seconds)
* At the end of every job

The archive data for each node are stored on a shared filesystem for
subsequent processing by the job summarization software.

Install the PCP data collector on the compute nodes
-------------------------------------------

The PCP software has been included in the official CentOS packages since CentOS 7.6. Builds
for other distributions (and earlier versions) are available from the
[official PCP dowload page](https://pcp.io/download.html),

The CentOS RPM packages of the summarization software (versions <= 1.4.1) are tested against the version of PCP
that is provided with CentOS 7 (This is PCP version 4.3.2 as of CentOS 7.8). The Rocky RPM packages
of the summarization software (versions >= 2.0.0) are tested against the version of PCP that is provided with
Rocky 8 (PCP version 5.3.7).

For an RPM based install on CentOS 7, the following command will install PCP with
all of the associated PMDAS (monitoring plugins) that have been tested with the
summarization software:

    # yum install pcp \
                  pcp-manager \
                  pcp-conf \
                  pcp-libs \
                  python-pcp \
                  perl-PCP-PMDA \
                  pcp-system-tools \
                  pcp-pmda-gpfs \
                  pcp-pmda-lustre \
                  pcp-pmda-infiniband \
                  pcp-pmda-mic \
                  pcp-pmda-nvidia-gpu \
                  pcp-pmda-nfsclient \
                  pcp-pmda-perfevent \
                  pcp-pmda-json

For an RPM based install on Rocky 8, the following command will install PCP with
all of the associated PMDAs that have been tested with the summarization software:

    # dnf install pcp \
                  pcp-conf \
                  pcp-libs \
                  python3-pcp \
                  perl-PCP-PMDA \
                  pcp-system-tools \
                  pcp-pmda-gpfs \
                  pcp-pmda-lustre \
                  pcp-pmda-infiniband \
                  pcp-pmda-mic \
                  pcp-pmda-nvidia-gpu \
                  pcp-pmda-nfsclient \
                  pcp-pmda-perfevent \
                  pcp-pmda-json

For a source code install follow the instructions on the [official PCP site](https://pcp.io/docs/installation.html).

Note that the node that runs the summarization software does not need to have all of the
PCP data collection components installed. It only requires the python pcp libraries.

Compatibility notes
-------------------

The summarization software is tested on CentOS 7 and Rocky 8 with the package versions of
PCP that are supplied with CentOS 7 and Rocky 8 (PCP versions 4.3.2 and 5.3.7 respectively).
In general any version of PCP will work as long as the summarization software is built against
the same or newer version of PCP as the version installed on the compute nodes.
