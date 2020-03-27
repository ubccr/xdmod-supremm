The job viewer tab in XDMoD is able to show the job batch script along
with the other job information. The job batch scripts are stored in the
database using the `ingest_jobscripts.py` script. This script is
packaged with the [Job Summarization software](supremm-processing-install.md).

The job script ingestion is an optional feature. It is _not_ required for XDMoD
to display job performance information.

The mechanism for extracting the job batch script is resource manager specific. Consult the
documentation for your resource manager software for information about
how to enable logging of the batch script.

## Source data schema

In order to ingest the script data into XDMoD the job scripts must be stored in files. There
must be one file per job and the jobs for a given day should be stored in a
datestamp named directory:
```
[BASEPATH]/YYYYMMDD/JOBID.savescript
```
where `YYYY` is the four digit year, `MM` two digit month, `DD` two digit day
and `JOBID` is the identifier for the job from the resource manager.
The date can refer to either the submit day, start day or end day of the job
but must be the same for all jobs for a resource. The configuration
settings for the path name and datestamp meaning described in the [configuration guide](supremm-processing-configuration.md).

The files are stored in datestamped directories because:
1. Storing the files by date limits the number of files per directory.
1. The datestamp is also used along with the job identifier to locate
the accounting record for the job. The datestamp is used because job identifiers
provided by a resource manager are typically not globally unique.
1. The datestamp is used to limit the number of files to scan each time the
`ingest_jobscripts.py` script runs.
