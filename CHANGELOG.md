Open XDMoD SUPReMM Change Log
=============================

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
