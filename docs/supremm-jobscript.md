The job viewer tab in Open XDMoD is able to show the job batch script along
with the other job information. The job batch scripts are stored in the
database using the `ingest_jobscripts.py` process. The `ingest_jobscripts.py` tool is
packaged with the [Job Summarization software](supremm-processing-install.md).

The ingestion of job batch scripts is an optional feature. It is _not_ required for Open XDMoD
to display job performance information.

The mechanism for extracting the job batch script is resource manager specific. Consult the
documentation for your resource manager software for information about
how to enable logging of the job batch script.

## Source data schema

In order to ingest the job batch script data into Open XDMoD the job batch scripts must be stored in files. There
must be one file per job and the job batch scripts for a given day should be stored in a
datestamp named directory:
```
[BASEPATH]/YYYYMMDD/JOBID.savescript
```
where `YYYY` is the four digit year, `MM` two digit month, `DD` two digit day
and `JOBID` is the identifier for the job from the resource manager.
The date must be the submit day of the job.  The configuration
setting for the path name is described in the [configuration guide](supremm-processing-configuration.md).

The files are stored in datestamped directories because:
1. Storing the files by date limits the number of files per directory.
1. The datestamp is also used along with the job identifier to locate
the accounting record for the job. The datestamp is used because job identifiers
provided by a resource manager are typically not globally unique.
1. The datestamp is used to limit the number of files to scan each time the
`ingest_jobscripts.py` process runs.
