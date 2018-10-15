After the PCP software has been installed on each compute node it should be configured so that
data are collected:

* At the start of every job
* 10, 20 and 30 seconds after job start
* Periodically during the job (recommended 30 seconds)
* At the end of every job

The archive data for each node are stored on a shared filesystem for
subsequent processing by the job summarization software.

## Prerequisites

The PCP collection software should have been installed on the compute nodes.

Configuration Templates
-----------------------

The [Job Summarization software][] includes template files that can be used to
configure PCP collection on the compute nodes.  The package itself should not
be installed on the compute nodes, however you may wish to install it
on a test node in order to obtain the PCP configuration file templates.
Alternatively, the scripts may be extracted directly from the source tarball.

These templates are available:
------------------------------
#### /usr/share/supremm/templates/pmlogger/control
* Moved to: /etc/pcp/pmlogger
    * Remove any existing files under: /etc/pcp/pmlogger/control.d
* **THIS CHANGE MUST BE MADE**
    * Edit the file to specify the path to the shared filesystem. The log files must be accessible by the node that has the Job Summarization software installed
    * "PCP_LOG_DIR/pmlogger/LOCALHOSTNAME/$(date +%Y)/$(date +%m)/$(date +%d)"
        * Changed to something like: "/<GLOBAL_SHARED_SPACE>/supremm/pmlogger/LOCALHOSTNAME/$(date +%Y)/$(date +%m)/$(date +%d)"
        * Where "LOCALHOSTNAME" is that exact literal string

#### /usr/share/supremm/templates/pmlogger/pmlogger-supremm.config
* Moved to /etc/pcp/pmlogger
* Can be updated to change metrics logged or frequency
    * You may wish to reduce logging frequency from the default 30 seconds until confirming impact on your system and storage utilization

#### /usr/share/supremm/slurm/slurm-prolog

This script will run data collection at job start time and three additional samples
at ten second intervals. This script should be merged into your existing prologue script.
This script is designed for and tested with the [Slurm][] resource manager.

#### /usr/share/supremm/slurm/slurm-epilog

This script will run data collection at job end. This script should be merged into your existing epilogue script.
This script is designed for and tested with the [Slurm][] resource manager.

#### /usr/share/supremm/hotproc/hotproc.conf
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

    $ systemctl restart pmcd

[Job Summarization software]: supremm-processing-install.md
[Slurm]: https://www.schedmd.com/
