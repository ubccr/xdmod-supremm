After the PCP software has been installed on each compute node it should be configured so that
data are collected:

* At the start of every job
* 10, 20 and 30 seconds after job start
* Periodically during the job (recommended 30 seconds)
* At the end of every job

The archive data for each node should be stored on a shared filesystem for
subsequent processing by the job summarization software.

It is recommended to store the archives in a directory structure
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
 the existing directory stucture is not an issue then do not change to the new one.

## Prerequisites

The PCP collection software should have been installed on the compute nodes.

Configuration Templates
-----------------------

The [Job Summarization software][] includes template files that can be used to
configure PCP collection on the compute nodes.  The package itself should not
be installed on the compute nodes, however you may wish to install it
on a test node in order to obtain the PCP configuration file templates.
Alternatively, the scripts may be extracted directly from the source tarball.
The template files should be edited before use.

These templates are available:
------------------------------
#### /usr/share/supremm/templates/pmlogger/control

This template file **must** be edited to specify the path to the directory
where the PCP archives are to be saved.

The path `PCP_LOG_DIR/pmlogger` should be changed to the path  where the PCP archives are to be saved.

The edited template should be saved in the `/etc/pcp/pmlogger` directory and  any existing files under
`/etc/pcp/pmlogger/control.d` should be removed.

Note that the string `LOCALHOSTNAME` in the file is expanded by the pcp logger software to the hostname
of the compute node running the logger.

#### /usr/share/supremm/templates/pmlogger/pmlogger-supremm.config
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

#### /usr/share/supremm/templates/hotproc/hotproc.conf
* Moved to /var/lib/pcp/pmdas/proc

This configuration file sets the parameters for process logging into the pcp
archives. It prevents the logging of system processes, unless they consume
significant resources.  This will reduce disk usage by the pcp archives.

Enable logging modules (PMDAs)
-----------------------------
* By default, in order to be lightweight, PCP does not enable all logging modules (PMDAs)
* They may be enabled by creating a ".NeedInstall" file which instructs the PCP framework
to enable the PMDA on next restart.

<!-- Empty Comment to fix broken markdown parsing -->

    $ touch /var/lib/pcp/pmdas/slurm/.NeedInstall
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

The daily housekeeping processes that run from cron for PCP
will attempt to do some cleanup that is not necessary when ingesting
the PCP archives into XDMoD. You should add the `-M` flag to pmlogger_daily
line in the `/etc/cron.d/pcp-pmlogger` file.  This will disable the process
that runs daily to combine multiple archives into one file.  XDMoD can
handle these files with no problem, and this process uses unnecessary resources.
You may also wish to adjust the retention period for old archives
with the `-k` parameter. See `man pmlogger_daily` for more information. The
following line will disable the daily rollup and keep archives forever.

    10     0  *  *  *  pcp  /usr/libexec/pcp/bin/pmlogger_daily -M -k forever

Adjust the retention policy to suit your needs of reprocessing old data.

Restart PMCD
--------------------------------

After making configuration changes to the PMDAs, you will need to restart the pmcd
service.  On a systemd enabled system, this can be done with:

    $ systemctl restart pmcd pmlogger

[Job Summarization software]: supremm-processing-install.md
[Slurm]: https://www.schedmd.com/
