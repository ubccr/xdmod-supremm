Open XDMoD SUPReMM Change Log
=============================

## 2025-03-17 v11.0.1

- Miscellaneous
    - Updated for compatibility with Open XDMoD 11.0.1.

## 2024-09-16 v11.0.0

- Features
    - Add GPU Count group by ([\#379](https://github.com/ubccr/xdmod-supremm/pull/379))
    - Update the efficiency tab for plotly ([\#360](https://github.com/ubccr/xdmod-supremm/pull/360))

- Enhancements
    - Add new commmunity applications to identification database ([\#361](https://github.com/ubccr/xdmod-supremm/pull/361), [\#376](https://github.com/ubccr/xdmod-supremm/pull/376))
    - Make `application_id` field available for batch export. ([\#368](https://github.com/ubccr/xdmod-supremm/pull/368))

- Bug Fixes
    - Order scatter plot data by usage instead of efficiency statistic.  ([\#323](https://github.com/ubccr/xdmod-supremm/pull/323))
    - Add `LEAST()` function to SQL that gets the `wall_time_accuracy` value. ([\#324](https://github.com/ubccr/xdmod-supremm/pull/324))
    - Use different endpoint for filter values on efficiency tab filter store freeform search.  ([\#325](https://github.com/ubccr/xdmod-supremm/pull/325))
    - Fix bugs in resource specification queries for the internal dashboard. ([\#366](https://github.com/ubccr/xdmod-supremm/pull/366))
    - Sanitize NAN values from timeseries data ([\#353](https://github.com/ubccr/xdmod-supremm/pull/353))

- Maintenance
    - Updates to Support PHP7.4 ([\#373](https://github.com/ubccr/xdmod-supremm/pull/373))
    - Replace redundant exception classes with ones provided by Symfony. ([\#355](https://github.com/ubccr/xdmod-supremm/pull/355))
    - Remove jQuery as a dependency ([\#380](https://github.com/ubccr/xdmod-supremm/pull/380), [\#377](https://github.com/ubccr/xdmod-supremm/pull/377))
    - Update jsPlumb dependency. ([\#372](https://github.com/ubccr/xdmod-supremm/pull/372))
    - Refactor job data set analysis fields ([\#256](https://github.com/ubccr/xdmod-supremm/pull/256))

- Miscellaneous
    - Use the portal's time zone for raw data query dates instead of UTC. ([\#356](https://github.com/ubccr/xdmod-supremm/pull/356))
    - Various CI test updates ([\#369](https://github.com/ubccr/xdmod-supremm/pull/369), [\#381](https://github.com/ubccr/xdmod-supremm/pull/381), [\#350](https://github.com/ubccr/xdmod-supremm/pull/350), [\#367](https://github.com/ubccr/xdmod-supremm/pull/367), [\#354](https://github.com/ubccr/xdmod-supremm/pull/354))


## 2023-09-11 v10.5.0

- Bug Fixes
   - Updates to mitigate php warning seen using php 7.2 (Rocky 8)

- Features
   - Updated default dataset mapping filename to remove the datasource name. The same
     mapping file can be used with both PCP and Prometheus data sources.

## 2023-05-11 v 10.0.1

- Bug Fixes
   - Fix bug in Efficiency Tab drilldown. This bug is only seen when using php 7.2 (Rocky 8).

## 2022-03-10 v 10.0.0

- Features
   - Added new "Efficiency" tab that provides reporting and analysis of HPC job
     efficiency.
   - Added new statistics to the Usage and Metric Explorer. These are  wall
     time accuracy, total GPU usage, Homogeneity and Averge max memory. See the online
     help in XDMoD for full details about these new statistics.
   - Added new dimensions to the Usage and Metric Explorer. These are homogeneity
     rank, total GPU usage and wall time accuracy value See the online
     help in XDMoD for full details about these new dimensions.

- Miscellaneous
   - Updated nodejs dependency version to nodejs >= 16.13

- Bug Fixes
   - Fix database timeout exception that could occur when running the aggregation
     for a large number of jobs (such as reaggregating the whole datawarehouse or
     using an I/O bound database server).

## 2021-05-21 v 9.5.0

- Features
   - added configuration parameter to `aggregate_supremm.sh` script to control whether
     database table analysis runs.

- Changes
   - The application classifier now ignores the `sleep` program when searching
     for candidate scientific codes.
   - Update to latest version of the nodejs mongo driver.

- Miscellaneous
   - Updates to internal logging code for compatibility with Open XDMoD 9.5


- Bug Fixes
   - fix numerical error in the calculation for "Walltime per Job' and 'Requested Wall time per Job' metrics
     in aggregate plot mode. Previously the calculation would ignore jobs that were running, but did not
     end in the time interval that was plotted.
   - add missing category information for Share mode, Resource and Queue search filters in the
     Job Viewer advanced search interface.

## 2020-08-13 v9.0.0
- Features
    - Add analyze-tables flag to the aggregate_supremm.sh script to control
      whether the SQL table analyze is run after aggregation. ([\#208](https://github.com/ubccr/xdmod-suprem/pull/208))
    - Add ability to drill down to the list of jobs from the job efficiency dashboard
      components ([\#230](https://github.com/ubccr/xdmod-suprem/pull/230) and [\#233](https://github.com/ubccr/xdmod-suprem/pull/233))

- Changes
    - Update internal configuration files to work with the new Open XDMoD datawarehouse
      Group By and Statistics configuration mechanism. ([\#218](https://github.com/ubccr/xdmod-suprem/pull/218))
    - Update internal configuration files to work with the new Open XDMoD raw data
      configuration mechanism ([\#238](https://github.com/ubccr/xdmod-suprem/pull/238))
    - Update the display order of the 'Exit Status' filter to be deterministic ([\#235](https://github.com/ubccr/xdmod-suprem/pull/235))
    - Add extra fields to support integration with Open On Demand ([\#241](https://github.com/ubccr/xdmod-suprem/pull/241))

- Miscellaneous
    - Various updates to CI tests ([\#211](https://github.com/ubccr/xdmod-suprem/pull/211), [\#216](https://github.com/ubccr/xdmod-suprem/pull/216), [\#217](https://github.com/ubccr/xdmod-suprem/pull/217), [\#223](https://github.com/ubccr/xdmod-suprem/pull/223), [\#224](https://github.com/ubccr/xdmod-suprem/pull/224), [\#225](https://github.com/ubccr/xdmod-suprem/pull/225), [\#234](https://github.com/ubccr/xdmod-suprem/pull/234))
    - Remove legacy code in the admin dashboard tab ([\#239](https://github.com/ubccr/xdmod-suprem/pull/239))

- Bug Fixes
    - Update the application category for the pegasus workflow software. Previously
      it was incorrectly marked as having a proprietary license. ([\#227](https://github.com/ubccr/xdmod-suprem/pull/227))

## 2019-10-21 v8.5.0
- Features
    - Add Job Efficiency reporting capability. This includes classification
      of jobs based on performance metrics and components for the new Dashboard
      tab that show the efficiency metrics by user.
    - Add ability to export Job Performance data via the new Data Export tab.
    - Added extra statistics for mounted filesystems `/home`, `/projects` and
      `/util`. The default source data for these statistics is from the
      nfs mounted filesystems.
    - Added ability to configure which devices are used for the various I/O
      metrics.

- Miscellaneous
    - Various updates to the module required to support XDMoD 8.5.
    - The automated CI testing now confirms that the software works with a
      password protected MongoDB database.
    - Add more automated CI tests.

- Bug Fixes
    - Jobs listed in the advance search results in the job viewer and in the show raw data
      dialog in the metric explorer are now guaranteed to be ordered based on the
      job end time.


## 2019-04-23 v8.1.0
- Features
    - Add support for GPU metrics. If available, the GPU usage and GPU memory
      usage for job are shown in the Job Viewer. It is now possible to group
      and filter by GPU usage in the Metric and Usage Explorer tabs.
    - Add support for energy metrics. If available, energy metrics for a job
      are shown in the Job Viewer.  Energy metrics are not available in the
      Metric or Usage Explorer tabs.
    - Improve the application identification algorithm and add more community
      applications to the database.
    - Add more command line options to the sharedjobs script to control which
      resources are scanned and the scan time range.
    - Improve performance of the sharedjobs script when processing large
      amounts of data (~millions of jobs at a time).

- Bug Fixes
    - The data mapping for InfiniBand metrics previously would only use data for the
      hardcoded mlx0 device. The mapping has been updated to default to the first
      available InfiniBand device.
    - Add job end time as an additional unique constraint on the jobhosts table.
    - Updated label for GPU usage displayed in the job viewer.

- Miscellaneous
    - Several updates required by internal API changes in xdmod 8.1. This
      includes updates to the internal API for the Job Viewer search and
      updates for the internal configuration file API.
    - The nodejs library dependencies are now packaged in the main xdmod and no
      longer need to be installed/updated as a separate step. Removed code
      associated with this install step.
    - The dynamically generated MySQL tables are now managed via the ETLv2
      framework.
    - Updates to the continuous integration (CI) scripts to add more tests.
    - Update mongodb driver version

## 2018-11-08 v8.0.0
- Features
    - Improved performance of aggregation process by switching to the ETLv2 framework.
    - Improved performance of shared jobs analysis script.

- Bug Fixes
    - Changed the database table that stores job scripts so that it can support job arrays and fixed
      missing unique key that resulted in redundant data storage.
    - Only show enabled resources in the Internal Dashboard dataflow diagram.

- Miscellaneous
    - Updated documentation and added troubleshooting information.
    - Added a `xdmod-supremm-jobinfo` script that prints information about individual
      jobs. This is intended to be used for troubleshooting purposes.


## 2018-03-14 v7.5.1

- Bug Fixes
    - Added acl-config call to the database setup

## 2018-03-01 v7.5.0

- Features
    - Added PDF export support to the Job Viewer
- Bug Fixes
    - Fix erroneous error message seen when running the ingest process for resources
      where the exit status is not reported by the resource manager
- Miscellaneous
    - Added tests
    - Additions to the application categorization database

## 2017-09-21 v7.0.0

- Features
    - Added support for viewing job peers in Job Viewer ([\#52](https://github.com/ubccr/xdmod-supremm/pull/52))
    - Improved Mongo configuration process ([\#59](https://github.com/ubccr/xdmod-supremm/pull/59))
    - Enabled dataflow diagram for Open XDMoD administrators ([\#60](https://github.com/ubccr/xdmod-supremm/pull/60))
- Bug Fixes
    - Fixed issue that allowed incompatible versions of XDMoD and this module to be installed when installing via RPM ([\#67](https://github.com/ubccr/xdmod-supremm/pull/67))
- Miscellaneous
    - Updated for compatibility with Open XDMoD 7.0.0 ([\#51](https://github.com/ubccr/xdmod-supremm/pull/51))
    - Moved Node.js ETL framework to Open XDMoD repository ([\#40](https://github.com/ubccr/xdmod-supremm/pull/40))
    - Performed work in anticipation of federated instances ([\#48](https://github.com/ubccr/xdmod-supremm/pull/48))
    - Improved development workflow ([\#41](https://github.com/ubccr/xdmod-supremm/pull/41))
    - Improved quality assurance ([\#42](https://github.com/ubccr/xdmod-supremm/pull/42), [\#49](https://github.com/ubccr/xdmod-supremm/pull/49), [\#50](https://github.com/ubccr/xdmod-supremm/pull/50), [\#55](https://github.com/ubccr/xdmod-supremm/pull/55), [\#56](https://github.com/ubccr/xdmod-supremm/pull/56), [\#58](https://github.com/ubccr/xdmod-supremm/pull/58))
    - Improved documentation ([\#61](https://github.com/ubccr/xdmod-supremm/pull/61), [\#67](https://github.com/ubccr/xdmod-supremm/pull/67), [\#68](https://github.com/ubccr/xdmod-supremm/pull/68))

2017-05-11 v6.6.0
-----------------

- Features
    - Improved application classification code
      ([\#27](https://github.com/ubccr/xdmod-supremm/pull/27),
       [\#39](https://github.com/ubccr/xdmod-supremm/pull/39))
- Bug Fixes
    - Fixed Job Viewer load error with version 4 timeseries documents
      ([\#24](https://github.com/ubccr/xdmod-supremm/pull/24))
    - Fixed aggregators excluding data on certain time boundaries
      ([\#25](https://github.com/ubccr/xdmod-supremm/pull/25))
    - Fixed handling of certain errors in job summaries
      ([\#38](https://github.com/ubccr/xdmod-supremm/pull/38))
- Miscellaneous
    - Cleaned up old and/or unused code
      ([\#28](https://github.com/ubccr/xdmod-supremm/pull/28))
    - Improved logging
      ([\#11](https://github.com/ubccr/xdmod-supremm/pull/11))
    - Improved quality assurance
      ([\#17](https://github.com/ubccr/xdmod-supremm/pull/17),
       [\#19](https://github.com/ubccr/xdmod-supremm/pull/19),
       [\#22](https://github.com/ubccr/xdmod-supremm/pull/22),
       [\#23](https://github.com/ubccr/xdmod-supremm/pull/23),
       [\#26](https://github.com/ubccr/xdmod-supremm/pull/26),
       [\#29](https://github.com/ubccr/xdmod-supremm/pull/29),
       [\#30](https://github.com/ubccr/xdmod-supremm/pull/30),
       [\#34](https://github.com/ubccr/xdmod-supremm/pull/34),
       [\#35](https://github.com/ubccr/xdmod-supremm/pull/35))

2017-01-10 v6.5.0
-----------------

**Important Note**: This update adds a dependency to npm. If you are updating
an existing installation via RPM, you will need to reinstall npm
dependencies afterward. To do this, run the commands below.

```bash
# Assuming XDMoD's share directory is RPM default "/usr/share/xdmod"

cd /usr/share/xdmod/etl/js
npm install
```

- Features
    - General
        - Added peak memory usage metric.
        - Improved application identification data.
        - Added aggregation data removal to the data reset script.
        - Added ability to track metrics for a "projects" filesystem.
    - Job Viewer
        - Added a count column to the detailed metrics pane to show how many
          data points were used to calculate the metrics.
    - Node ETL
        - Added support for uppercase auto-generated labels.
- Bug Fixes
    - Job Viewer
        - Fixed "Show Raw Data" button in Metric Explorer not filtering results
          correctly when using some combinations of drilldowns and filters.
        - Fixed single-point datasets not appearing in exported charts.
        - Fixed Search History tree sorting nodes that should not be sorted.
        - Fixed "Show Raw Data" window in Metric Explorer staying active after
          the chart underneath it changes (for example, when a new chart is
          imported from Usage).
        - Improved handling of raw data specified in kilobytes and megabytes
          in Detailed Metrics pane.
        - Fixed handling of Search History entries that have numeric names.
    - Node ETL
        - Fixed ingestion process hanging indefinitely if it failed to
          connect to the Mongo database at certain points.
        - Fixed SQL statement queue sometimes batching more statements
          together in one MySQL driver call than the driver can handle.
- Refactors and Miscellaneous
    - Spun this module out from the Open XDMoD repository.
        - Note that although the Job Viewer and Node ETL is part of Open XDMoD,
          changes will continued to be tracked as part of SUPReMM as long as it
          is the only user of both.
        - Also note that the Job Viewer is included with Open XDMoD install
          packages, whereas the Node ETL is included with SUPReMM packages.
    - Moved to custom option parser that supports long options and
      multi-character short options.
        - This replaces minimist and removes it as a dependency.

2016-09-21 v6.0.0
-----------------

- Features
    - General
        - Added ability to redact specific job-level values for some users.
    - Job Viewer
        - Added sort options to search history panel.
        - Organized advanced search filters into categories.
        - Modified timeseries charts to use the timezone of a job's resource
          instead of the timezone used by the web browser.
        - Modified analytics pane to always be present and explain why missing
          data is missing.
        - Modified byte units to use IEC prefixes instead of SI ones.
        - Allowed some metrics to be displayed in multiple tabs.
        - Added tooltips to advanced search filters.
        - Added tooltips to detailed metrics.
        - Added help sections to tabs that didn't have any previously.
        - Added a help button to the at-a-glance analytics.
        - Added a loading message to charts that are loading.
- Bug Fixes
    - Job Viewer
        - Fixed a number of cases where editing a search did not work as
          expected.
        - Fixed case where timeseries chart drilldowns stopped working after
          leaving the Job Viewer and returning.
        - Fixed case where a top-level timeseries chart was exported instead of
          the current, drilled-down chart.
        - Fixed case where timeseries chart drilldowns performed on a chart were
          not reflected in the navigation tree.
        - Fixed case where selecting a low-level timeseries chart in the
          navigation tree opened a top-level chart instead.
        - Fixed basic search resource list loading immediately on page load.

2016-05-24 v5.6.0
-----------------

- New Features
    - Configuration
        - Switched to URL-based method for specifying Mongo databases.
            - This adds support for Mongo databases that require authentication.
        - Improved setup process to be more user-friendly.
            - The interactive setup script now generates the required
              configuration files.
        - Improved configuration file structure.
    - Data Processing
        - Added ability to transfer ingested/aggregated data between databases.
            - This allows SUPReMM data to be reprocessed in a secondary database
              before deploying a new version of the SUPReMM ingestor in the main
              XDMoD instance.
        - Improved logging for ingestion and aggregation scripts.
    - Job Viewer
        - Added ability to edit searches.
        - Improved layout of search window.
        - Added ability to export timeseries plots as images or CSV data.
- Bug Fixes
    - Job Viewer
        - Added error dialog box for if Quick Job Lookup's resource list fails
          to load instead of silently failing.
        - Fixed existing searches breaking after performing a re-ingest of
          SUPReMM data.
        - Fixed charts sometimes not resizing properly.
        - Fixed memory leak in search history right-click menu.

2015-12-18 v5.5.0beta1
----------------------

- Initial public release
