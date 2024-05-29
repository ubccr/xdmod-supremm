---
title: Customization
---

This document describes some advanced customizations for the Job Performance module.

**The automated upgrade scripts do not have any support for preserving
customizations. Any changes made to the underlying Open XDMoD source code
will likely be overwritten when the software is upgraded.**

## Job Analytics

The job analytics panel shows selected job performance metrics in color
coded plots across the top of the job tab in the Job Viewer. The value of
each metric in the panel is normalized so a value near 1 means a favourable
value and a value near 0 indicates an unfavourable value.

There are five default analytics. These are the CPU Usage,
Homogeneity, CPU Balance, Memory Efficiency, and Walltime Accuracy, see Figure 1
below. If the CPU Usage metric is unavailable then the analytics toolbar is not displayed.
If any of the other metrics are unavailable then an error message is displayed.

<figure>
<img src="{{ site.baseurl }}/assets/images/analytics_with_five.png" alt="Screenshot of the analytics toolbar. The toolbar has five different boxes arranged in a line. Each box shows a performance metric name, metric value and a bar plot that also indicates the value." />
<figcaption>Figure 1. Example screenshot of the analytics toolbar.</figcaption>
</figure>

A common reason why an analytic is unavailable is that the underlying data was not collected
when the job was running. For example, the homogeneity analytic uses the L1D load count and
CPU clock tick counter hardware counter data. If the hardware counter data were not configured
to be collected or the hardware does not support a L1D load counter then the homogeneity
metric will be unavailable. An example of the display in this case is shown in Figure 2.

<figure>
<img src="{{ site.baseurl }}/assets/images/analytics_unavailable.png" alt="Screenshot showing a performance metric from the analytics toolbar where the performance datum is unavailable. The metric display shows an exclamation mark icon with the text 'Metric Missing: Not Available On The Compute Nodes'" />
<figcaption>Figure 2. Example analytics metric display when the datum is unavailable.</figcaption>
</figure>

If an analytic will always be unavailable (for example, due to the absence of
hardware support), then the Open XDMoD instance can be customized to never show it.

**This customization will not be preserved if the Open XDMoD software is updated.**

**These instructions only apply to Open XDMoD {{ page.sw_version }}. For other
versions please refer to the documentation for that release.**

To remove an analytic you need to edit `/usr/share/xdmod/etl/js/config/supremm/etl.schema.js`
and remove the code associated with the analytic. For example to remove the homogeneity
analytic you would remove (or comment out) lines 2716–2732.  The lines to remove are shown below.
```js
2716             homogeneity: {
2717                 name: 'Homogeneity',
2718                 formula: '(1.0 - (1.0 / (1.0 + 1000.0 * jf.catastrophe)))',
2719                 withError: {
2720                     name: 'homogeneity_error',
2721                     column: 'catastrophe',
2722                     tableAlias: 'je'
2723                 },
2724                 unit: 'ratio',
2725                 per: 'job',
2726                 visibility: 'public',
2727                 comments: 'A measure of how uniform the L1D load rate is over the lifetime of the job. ' +
2728                     'Jobs with a low homogeneity value (~0) should be investigated to check if there ' +
2729                     'has been a catastrophic failure during the job',
2730                 batchExport: true,
2731                 dtype: 'analysis'
2732             },
```

After editing the file, run:
```
# node /usr/share/xdmod/etl/js/etl.cli.js -i
```

To change the order in which the analytics appear in the toolbar, edit the
`metricOrder` variable in `/usr/share/xdmod/html/gui/js/modules/job_viewer/JobPanel.js`.

## Application Identification

The Application dimension in the SUPREMM realm allows filtering and grouping
by the community software application that was run by each job. In the default
configuration, the software application is inferred at job ingest time by
comparing the paths to the executables with a list of known community applications.

This list of applications is maintained in the `share` directory (whose location depends on how you installed XDMoD, e.g., `/usr/share/xdmod`, `/opt/xdmod/share`) under `etl/js/config/supremm/application.json`
The `application.json` file contains an ordered list of community applications and
a corresponding set of regular expressions that are tested against the
executable (i.e., the executable path with the leading directory components removed). If an executable matches, then the job is assigned the corresponding
application. The applications are processed in the order they appear in the file, and the match with the highest
priority is used. If no match is found, then the application is assigned
to 'uncategorized'. If no executable path information is available, then the
application is assigned 'NA'.

An example entry in the file is shown below:

```json
    {
        "name": "gransim",
        "license_type": "permissive",
        "science_area": "Biology",
        "url": "http://malthus.micro.med.umich.edu/lab/",
        "execmatch": [
            "^gr$",
            "^gr-co$",
            "^gr-co-[0-9]{4}$",
            "^gr-[0-9]{4}-[23]d-co$"
        ]
    }
```

In this example the 'gransim' application has four different regular expressions
that are tested against the executable.

| Field | Type | Description |
| ----- | ---- | ----------- |
| `name`  | [String] | The name of the application &mdash; this must be unique. |
| `license_type` | `permissive` \| `proprietary` | Information about the software license. If the software has a license that restricts publishing of performance data, then set this field to <code>proprietary</code>; otherwise, <code>permissive</code> should be used. The application names for <code>proprietary</code> licensed code do not appear in the XDMoD portal. |
| `science_area` | [String] | The science area of the application. This information is stored in the XDMoD data warehouse, but is not displayed in the portal. |
| `url`  | [String] | The website of the application. This information is stored in the XDMoD data warehouse, but is not displayed in the portal. It is intended to assist developers in disambiguating software applications that have similar names. |
| `execmatch` | OPTIONAL LIST | Optional list of regular expressions that will be checked against the executable (i.e., the executable path with the leading directory components removed). |
| `pathmatch` | OPTIONAL LIST | Optional list of regular expressions that will be checked against the executable path. |
| `hints`     | deprecated | Deprecated, do not use. |


### Customizing the application lookup

#### Modifying regular expressions

The `execmatch` and/or `pathmatch` fields in the application mapping are
read and processed at ingest time (when the job data is loaded from mongodb
into the XDMoD data warehouse).  The application lookup regular expressions
can be edited to suit your environment. Edits to the regular expressions
will impact jobs that are ingested after the file is changed and will
not change the data for jobs that are already loaded into XDMoD.

#### Adding new applications

New application definitions should be added at the end of the file. Once
the new definition has been added, then the database dimension tables
must be updated as follows (Note: depending on how you installed XDMoD, `/usr/share/xdmod` should be replaced with `/opt/xdmod/share` or the correct path to the `share` directory, and `/etc/xdmod` should be replaced with `/opt/xdmod/etc` or the correct path to the `etc` directory).

First update the SQL definition file for the application tables:
```
# cd /usr/share/xdmod/etl/js
# node etl.cli.js -o > /etc/xdmod/etl/etl_sql.d/supremm/application.sql
```
Then use the `mysql` command line client to update the database with the new table contents:
```
# mysql < /etc/xdmod/etl/etl_sql.d/supremm/application.sql
```
The new application definitions will impact jobs that are ingested after the file
is changed and will not change the data for jobs that are already loaded into XDMoD.

#### Updating application category for existing jobs

If you want to back-populate the data for jobs that were previously ingested into
XDMoD then you can either (1) reset the database and re-ingest all jobs, or (2) you can
 run an SQL update statement to update the application for existing jobs.
Running an SQL update statement will typically be faster.

Instructions for reseting and re-ingesting data are in [extending.md#4-re-ingest-data-into-xdmod](Section 4 of the data
mapping extending guide).

Instructions for running the SQL update statement are below.  **Always make sure to create a backup of the SQL database before running
SQL updates.**

For example, if you had updated the `application.json` with the following 'new'
application:
```json
    {
        "name": "NEXMD",
        "license_type": "permissive",
        "science_area": "Molecular Dynamics",
        "url": "https://github.com/lanl/NEXMD",
        "execmatch": [
            "^nexmd.exe$"
        ]
    }
```
You could use the following SQL statements to update historical jobs
that were previously uncategorized and had a executable of 'nexmd.exe':

```sql
LOCK TABLES `modw_supremm`.`application` AS a READ, `modw_supremm`.`job` AS j WRITE, `modw_supremm`.`executable` AS e WRITE;

UPDATE `modw_supremm`.`job` j, `modw_supremm`.`executable` e, `modw_supremm`.`application` a
SET j.`application_id` = a.`id`, e.`application_id` = a.`id`
WHERE j.`executable_id` = e.`id` AND e.`application_id` = 0
   AND e.`binary` = 'nexmd.exe' AND a.`name` = 'NEXMD';

UNLOCK TABLES;
```
If you have an application regex that matches the executable path (`pathmatch`), then
the SQL `WHERE` condition should use the `e.exec` column.

After updating the tables, run the `aggregate_supremm.sh` script to reaggregate the data. The script will automatically detect which time periods need to be
reaggregated. The amount of time the script will take to run depends on the number of time periods
that need to be reaggregated. It is recommended to run the script in a `screen` or `tmux` session and
to include the `-d` debug flag so that you can monitor the progress:
```
# aggregate_supremm.sh -d
```

### Notes

Don't remove any existing entries from `application.json` &mdash; it will cause the database primary
keys to change and necessitate a complete deletion and reingestion of
all data. If there is an existing job entry that you don't want to match
at your site, then remove the regular expression definitions that cause
the false positive matches (if no regular expressions are defined
then the application will never be matched).

If you do edit `application.json`, you will need to re-apply those edits every time
you upgrade the XDMoD software. Make sure to re-apply the edits to the file and
rerun the `etl.cli.js -o` command _after_ installing the new version of XDMoD
 but  _before_ running the `xdmod-upgrade` command.

If you have added any new applications then they should be added in the same
relative location in the file. If the relative order of applications changes
then it will cause the database primary
keys to change and would necessitate a complete deletion and reingestion of
all data.
