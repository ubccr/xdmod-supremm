---
title: PCP Configuration - Compute Nodes
---

Obtain the suggested version of PCP (3.11.4)
-------------------------------------------

We have tested the install and configuration on Centos 6 and Centos 7.

* https://bintray.com/pcp/el6/pcp/3.11.4/
* https://bintray.com/pcp/el7/pcp/3.11.4/

The "Set Me Up" link on the bintray website provides instructions
for adding a yum repository, otherwise the files can be individually
downloaded from the "Files" link.

Install the desired modules on all compute nodes you wish to monitor
------------------------------------------------------------
For a full install with all monitors being used at CCR:

    # yum install pcp-3.*.x86_64.rpm pcp-conf-3.*.x86_64.rpm pcp-libs-3.*.x86_64.rpm \
               pcp-libs-devel-3.*.x86_64.rpm pcp-pmda-gpfs-3.*.x86_64.rpm \
               pcp-pmda-logger-3.*.x86_64.rpm pcp-pmda-lustre-3.*.x86_64.rpm \
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

Configuration Templates
-----------------------

The SUPReMM summarization package includes template files that can be used to configure PCP collection on the compute nodes.  The package itself does not need to be installed on the compute nodes, however you may wish to install it on a test node in order to obtain the PCP configuration file templates.

Package installation instructions are documented on the [SUPReMM summarization package](supremm-processing-install.html) page.

Alternatively, the templates may be extracted directly from the source tarball.

These templates are available:
------------------------------
#### /usr/share/supremm/templates/pmlogger/control
* Moved to: /etc/pcp/pmlogger
* **THIS CHANGE MUST BE MADE**
    * Edit the file to specify that the logs be written to shared space, accessable by the Supremm processing machine
    * "PCP_LOG_DIR/pmlogger/LOCALHOSTNAME"
        * Changed to something like: "/<GLOBAL_SHARED_SPACE>/supremm/pmlogger/LOCALHOSTNAME"
        * Where "LOCALHOSTNAME" is that exact literal string

#### /usr/share/supremm/templates/pmlogger/pmlogger-supremm.config
* Moved to /etc/pcp/pmlogger
* Can be updated to change metrics logged or frequency
    * You may wish to reduce logging frequency from the default 30 seconds until confirming impact on your system and storage utilization

The following configurations can be enabled if you wish to enable monitoring/restart of monitoring processes
------------------------------------------------------------------------------------------------------------
* This configuration can be used to ensure that PCP logging is restarted if any of the monitoring processes die for any reason.  This can occur specifically when a system is under high I/O load.  In this case, the PCP monitoring can stall while the OS deals with the I/O requests.  The PMIE process will monitor and log this condition and restart the daemons as appropriate.  This is not strictly necessary, but if this configuration is not done, intervention will be required to restart PCP manually if the monitoring processes die.
    * **This requires allowing the "pcp" user to run: "sudo /etc/pcp/pmie/pcp-restart.sh" without a password**

#### /usr/share/supremm/templates/pmda-logger/logger.conf
* Moved to /var/lib/pcp/config/logger
* No changes should be necessary

#### /usr/share/supremm/templates/pmie/control
* Moved to /etc/pcp/pmie
* No changes should be necessary

#### /usr/share/supremm/templates/pmie/pmie-supremm.config
* Moved to /etc/pcp/pmie
* No changes should be necessary

#### /usr/share/supremm/templates/pmie/pcp-restart.sh
* Moved to /etc/pcp/pmie
* Set execute bit

#### /usr/share/supremm/templates/pmie/procpmda_check.sh
* Moved to /etc/pcp/pmie
* Set execute bit

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


Start PCP
---------
    # systemctl enable pmcd pmlogger pmie
    # systemctl start pmcd pmlogger pmie

Check for Errors
----------------
It may take several seconds for all the PMDAs to start up

    $ cat /var/log/pcp/pmcd/*.log
    $ cat /<GLOBAL_SHARED_SPACE>/supremm/pmlogger/`hostname`/pmlogger.log

Check for Running processes
---------------------------
* Ensure the pmcd, pmlogger,pmie and any pmda processes you enabled are running

<!-- Empty Comment to fix broken markdown parsing -->

    $ ps -ef | grep -i pcp
        pcp      36927     1  0 Sep22 ?        00:00:00 pmie -b -h local: -l /var/log/pcp/pmie/srv-u13-27.cbls.ccr.buffalo.edu/pmie.log -c /etc/pcp/pmie/pmie-config.ubccr
        pcp      37221     1  0 Sep22 ?        00:00:03 /usr/libexec/pcp/bin/pmcd
        root     37223 37221  0 Sep22 ?        00:00:00 /var/lib/pcp/pmdas/root/pmdaroot
        root     37224 37221  0 Sep22 ?        00:11:43 /var/lib/pcp/pmdas/proc/pmdaproc -A
        root     37225 37221  0 Sep22 ?        00:00:00 /var/lib/pcp/pmdas/xfs/pmdaxfs -d 11
        root     37226 37221  0 Sep22 ?        00:00:13 /var/lib/pcp/pmdas/linux/pmdalinux
        pcp      37227 37221  0 Sep22 ?        00:00:03 /var/lib/pcp/pmdas/logger/pmdalogger /var/lib/pcp/config/logger/logger.conf
        pcp      37228 37221  0 Sep22 ?        00:00:30 /var/lib/pcp/pmdas/perfevent/pmdaperfevent -d 127
        pcp      42945     1  0 00:10 ?        00:00:00 pmlogger -r -m pmlogger_daily -P -l pmlogger.log -c /etc/pcp/pmlogger/pmlogger-config.ubccr 20150924.00.10

Check that archives are being created
-------------------------------------
It may take several seconds to minutes for the log to accumulate data depending on your logging frequency

    $ cd /<GLOBAL_SHARED_SPACE>/supremm/pmlogger/`hostname`
    $ ls
        20150924.14.16-00.0
        20150924.14.16-00.index
        20150924.14.16-00.meta

    $ pmdumplog -a 20150924.14.16-00

Ensure that the archives have the metrics you expect.
