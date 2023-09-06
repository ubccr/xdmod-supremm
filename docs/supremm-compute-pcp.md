**These instructions only apply to resources that will use PCP software. Configuration instructions for Prometheus can be found [here](supremm-compute-prometheus.html).**

This section gives example configuration settings for Performance Co-Pilot (PCP) running on the compute nodes
of an HPC cluster. These configuration guidelines are based on the PCP data collection setup
at CCR Buffalo, which uses PCP version 4.3.2 that is supplied with Centos 7.

Note that the PCP version 5.3.7 supplied with Rocky 8 does not support using date
variables in the pmlogger output path. The template pmlogger control file
is not suitable for use with PCP 5.

## Prerequisites

PCP should be installed on every compute node as described in the [install section](supremm-install-pcp.md).

## Configuration

After the PCP software has been installed on each compute node it should be configured so that
data are collected:

* At the start of every job
* 10, 20 and 30 seconds after job start
* Periodically during the job (recommended 30 seconds)
* At the end of every job

The archive data for each node needs to be readable by the job summarization software
process. We recommend that the archive data is stored on a shared filesystem such as a parallel filesystem
or network attached storage.

In order to constrain the number of files in a given directory,
we recommend storing the archives in a directory structure
that includes the hostname and the date in different subdirectories. The recommended
directory path is:

    [YYYY]/[MM]/[HOSTNAME]/[YYYY-MM-DD]

Where YYYY is the 4 digit year, MM 2 digit month, DD is the 2 digit day of the month
and HOSTNAME is the hostname of the compute node. The two main reasons for storing
the data in this way are (1) to minimize the number of files per directory and
(2) to reduce the I/O of the summarization software's indexing script. The
indexing script is designed to run daily and scans the filesystem for new PCP
archives. The script is able to exclude old directories from processing based
on the timestamp. This reduces the amount of I/O since only candidate
directories are scanned.

In previous versions of the summarization software the recommended path
was:

    [HOSTNAME]/[YYYY]/[MM]/[DD]

this directory structure is still supported by the indexing script and may
still be used. The reason for changing the recommendation is that the new directory
structure limits the total number of files under a given directory. This
helps reduce the runtime of backup software. If the filesystem I/O performance with
 the existing directory structure is not an issue then there is no need to change to the new one.

The archive indexing also supports the path structure where all the
PCP archives for a host are under the hostname directory:

    [HOSTNAME]

The disadvantage of this directory structure is that the number of files in the
hostname directory can become very large. If you do use this structure it is
recommended to create a script that is run periodically to remove or otherwise
archive older PCP files to limit the number of files in each hostname
directory. Large numbers of files in the log output directory will likely cause
poor performance of the PCP logging software and the summarization software.


Configuration Templates
-----------------------

The [Job Summarization software][] includes template files that can be used to
configure PCP collection on the compute nodes (if using PCP version 4).  The package itself should not
be installed on the compute nodes, however you may wish to install it
on a test node in order to obtain the PCP configuration file templates.
Alternatively, the scripts may be extracted directly from the source tar file or
from the [github repository][].

The PCP configuration templates are applicable to PCP version 4.3.2 that is
supplied with Centos 7 and may need to be modified to work with more recent versions
of the PCP software. The template logger control files should not
be used with PCP version 5 because this version does not support using
date substitutions in the logger pathname.


The template files must be edited before use.

These templates are available:
------------------------------
#### /usr/share/supremm/templates/pcp-4.3.x/pmlogger/control

This template file **must** be edited to specify the path to the directory
where the PCP archives are to be saved.

The path `PCP_LOG_DIR/pmlogger` should be changed to the path where the PCP archives are to be saved.

The edited template should be saved in the `/etc/pcp/pmlogger` directory and  any existing files under
`/etc/pcp/pmlogger/control.d` must be removed to ensure that there is only one primary logger
configured.

Note that the string `LOCALHOSTNAME` in the file is expanded by the pcp logger software to the hostname
of the compute node running the logger.

The template includes the following directive that disables the compression behavior so that the
archive files do not get compressed while the summarization software is
processing them:

```
$PCP_COMPRESSAFTER=never
```

The template also specifies the `-T24h10m`` option to the pmlogger process to ensure new log files
are created every day.

#### /usr/share/supremm/templates/pcp-4.3.x/pmlogger/pmlogger-supremm.config
* Moved to /etc/pcp/pmlogger
* Can be updated to change metrics logged or frequency
    * You may wish to reduce logging frequency from the default 30 seconds until confirming impact on your system and storage utilization

#### /usr/share/supremm/templates/slurm/slurm-prolog

This is a template perl script that **must** be edited. The string `/<GLOBAL_SHARED_SPACE>/supremm/pmlogger` must be
changed to match the directory where the PCP archives are to be saved.
This script will run data collection at job start time and three additional samples
at ten second intervals. This script should be merged into your existing prologue script.
This script is designed for and tested with the [Slurm][] resource manager.

#### /usr/share/supremm/templates/slurm/slurm-epilog

This is a template perl script that **must** be edited. The string `/<GLOBAL_SHARED_SPACE>/supremm/pmlogger` must be
changed to match the directory where the PCP archives are to be saved.
This script will run data collection at job end. This script should be merged into your existing epilogue script.
This script is designed for and tested with the [Slurm][] resource manager.

#### /usr/share/supremm/templates/pcp-4.3.x/hotproc/hotproc.conf
* Moved to /var/lib/pcp/pmdas/proc

This configuration file sets the parameters for process logging into the pcp
archives. It prevents the logging of system processes, unless they consume
significant resources.  This will reduce disk usage by the pcp archives.

Enable logging modules (PMDAs)
-----------------------------
By default, in order to be lightweight, PCP does not enable all logging modules (PMDAs)
They may be enabled by creating a ".NeedInstall" file in the PMDA directory. The presence
of this file causes the PCP framework
to enable the PMDA on next restart (`systemctl restart pmcd`).

The PMDAs that should be enabled will depend on the architecture of your cluster. For
example, if you have a Lustre filesystem then enable the Lustre PMDA, if you mount
filesystems over NFS then enable the nfsclient PMDA.

<!-- Empty Comment to fix broken markdown parsing -->

    $ touch /var/lib/pcp/pmdas/nvidia/.NeedInstall
    $ touch /var/lib/pcp/pmdas/gpfs/.NeedInstall
    $ touch /var/lib/pcp/pmdas/nfsclient/.NeedInstall
    $ touch /var/lib/pcp/pmdas/perfevent/.NeedInstall
    $ touch /var/lib/pcp/pmdas/mic/.NeedInstall
    $ touch /var/lib/pcp/pmdas/libvirt/.NeedInstall

Configure Global Process Capture
--------------------------------

By default, PCP does not allow the capture of process information for all users. XDMoD
can display process information only if the pcp user is permitted to log this
information from each compute host. See the relevant documentation in `man pmdaproc`.
To enable this, you must add the `-A` flag to the `pmdaproc` line
in `/etc/pcp/pmcd/pmcd.conf` like so:

    proc	3	pipe	binary 		/var/lib/pcp/pmdas/proc/pmdaproc  -A

Disable daily archive rollup
--------------------------------

PCP supports automatically compressing archives after they are created
to save disk space. The summarization software can read both compressed
and uncompressed archives. However there is a potential race
condition with the archive compression running at the same time as the
job summarization software runs. At CCR we disable the compression with
the following directive set in the pmlogger control file `/etc/pmlogger/control`

```
$PCP_COMPRESSAFTER=never
```


Restart PMCD
--------------------------------

After making configuration changes to the PMDAs, you will need to restart the pmcd
service.  On a systemd enabled system, this can be done with:

    $ systemctl restart pmcd pmlogger

Archive management notes
------------------------

Once the job summarization software has generated a record for a job then the PCP archives
are no longer required and could be deleted to save disk space. Jobs are summarized after
the job accounting information has been ingested into XDMoD and this happens after
they complete. So the minimum amount of time to keep archives is the maximum permissable
HPC job wall time plus the latency between a job ending and it appearing in XDMoD.

[Job Summarization software]: supremm-processing-install.md
[Slurm]: https://www.schedmd.com/
[github repository]: https://github.com/ubccr/supremm/tree/master/config/templates
