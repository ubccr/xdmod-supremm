The following describes how to check the PCP data collection.

## Prerequisites

The PCP software should have been [installed on the compute nodes](supremm-install-pcp.md) 
and [configured](supremm-compute-pcp.md) using the supplied templates. 

Start PCP
---------
    # systemctl enable pmcd pmlogger
    # systemctl start pmcd pmlogger

Check for Errors
----------------
It may take several seconds for all the PMDAs to start up

    $ cat /var/log/pcp/pmcd/*.log
    $ cat /<GLOBAL_SHARED_SPACE>/supremm/pmlogger/`hostname`/Y/M/D/pmlogger.log

Check for Running processes
---------------------------
* Ensure the pmcd, pmlogger and any pmda processes you enabled are running

<!-- Empty Comment to fix broken markdown parsing -->

    $ ps -ef | grep -i pcp
        pcp      37221     1  0 Sep22 ?        00:00:03 /usr/libexec/pcp/bin/pmcd
        root     37223 37221  0 Sep22 ?        00:00:00 /var/lib/pcp/pmdas/root/pmdaroot
        root     37224 37221  0 Sep22 ?        00:11:43 /var/lib/pcp/pmdas/proc/pmdaproc -A
        root     37225 37221  0 Sep22 ?        00:00:00 /var/lib/pcp/pmdas/xfs/pmdaxfs -d 11
        root     37226 37221  0 Sep22 ?        00:00:13 /var/lib/pcp/pmdas/linux/pmdalinux
        pcp      37227 37221  0 Sep22 ?        00:00:03 /var/lib/pcp/pmdas/logger/pmdalogger /var/lib/pcp/config/logger/logger.conf
        pcp      37228 37221  0 Sep22 ?        00:00:30 /var/lib/pcp/pmdas/perfevent/pmdaperfevent -d 127
        pcp      42945     1  0 00:10 ?        00:00:00 pmlogger -r -m pmlogger_daily -P -l pmlogger.log -c /etc/pcp/pmlogger/pmlogger-config.ubccr 20150924.00.10

Check that daily archives are being created
-------------------------------------
It may take several seconds to minutes for the log to accumulate data depending on your logging frequency

    $ cd /<GLOBAL_SHARED_SPACE>/supremm/pmlogger/`hostname`/Y/M/D
    $ ls
        20150924.14.16-00.0
        20150924.14.16-00.index
        20150924.14.16-00.meta

    $ pmdumplog -a 20150924.14.16-00

Ensure that the archives have the metrics you expect.

Check that job start and end archives are being created
-------------------------------------

If you configured data collection in the job prologue and epilogue then check that 
that these archives are created correctly. 

    $ cd /<GLOBAL_SHARED_SPACE>/supremm/pmlogger/`hostname`/Y/M/D
    $ ls job*
        job-4588146-begin-20180915.09.29.16.0
        job-4588146-begin-20180915.09.29.16.index
        job-4588146-begin-20180915.09.29.16.meta
        job-4588146-end-20180915.11.57.38.0
        job-4588146-end-20180915.11.57.38.index
        job-4588146-end-20180915.11.57.38.meta

    $ pmdumplog -a job-4588146-begin-20180915.09.29.16
      ...

    $ pmdumplog -a job-4588146-end-20180915.11.57.38
      ...
        
