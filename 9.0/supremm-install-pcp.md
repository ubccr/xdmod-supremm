
The PCP software should be installed on each compute node and configured so
that data are collected:

* At the start of every job
* 10, 20 and 30 seconds after job start
* Periodically during the job (recommended 30 seconds)
* At the end of every job

The archive data for each node are stored on a shared filesystem for
subsequent processing by the job summarization software.

Obtain the suggested version of PCP (3.12.2)
-------------------------------------------

We have tested the install and configuration on Centos 7.

* https://bintray.com/pcp/el7/pcp/3.12.2/

The "Set Me Up" link on the bintray website provides instructions
for adding a yum repository, otherwise the files can be individually
downloaded from the "Files" link.

Install the desired modules on all compute nodes you wish to monitor
------------------------------------------------------------
For a full install with all monitors that have been tested with XDMoD:

    # yum install pcp-3.*.x86_64.rpm pcp-conf-3.*.x86_64.rpm pcp-libs-3.*.x86_64.rpm \
               pcp-libs-devel-3.*.x86_64.rpm pcp-pmda-gpfs-3.*.x86_64.rpm \
               pcp-pmda-lustre-3.*.x86_64.rpm pcp-pmda-libvirt-3.*.x86_64.rpm \
               pcp-pmda-mic-3.*.x86_64.rpm pcp-pmda-nfsclient-3.*.x86_64.rpm \
               pcp-pmda-nvidia-gpu-3.*.x86_64.rpm pcp-pmda-perfevent-3.*.x86_64.rpm \
               pcp-pmda-slurm-3.*.x86_64.rpm pcp-system-tools-3.*.x86_64.rpm \
               perl-PCP-LogImport-3.*.x86_64.rpm perl-PCP-PMDA-3.*.x86_64.rpm \
               python-pcp-3.*.x86_64.rpm

#### PMDAs are the modules that monitor the actual subsystems you are interested in.
* The packages that are strictly required:
    * pcp
    * pcp-libs
    * pcp-libs-devel
    * pcp-conf
    * perl-PCP-PMDA
    * python-pcp

<!-- Empty Comment to fix broken markdown parsing -->

    # yum install pcp-3.*.x86_64.rpm pcp-libs-* pcp-conf-3.*.x86_64.rpm \
      perl-PCP-PMDA-3.*.x86_64.rpm  python-pcp-3.*.x86_64.rpm

#### Dependencies
* pcp-pmda-nvidia-gpu
    * Depends on Nvidia NVML
* pcp-pmda-perfevent
    * Depends on libpfm
* pcp-pmda-slurm
    * Depends on the SLURM perl bindings
* pcp-pmda-gpfs
    * Depends on the GPFS mmfs tools being installed
* pcp-pmda-infiniband
    * Depends on the libmad and libumad packages

