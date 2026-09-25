---
title: SUPReMM Open XDMoD module Upgrade Guide
---

General Upgrade Notes
---------------------

The Job Performance (SUPReMM) XDMoD module should be upgraded at the same time as the main Open XDMoD
software. The upgrade procedure is documented on the [Open XDMoD upgrade
page](https://open.xdmod.org/upgrade.html). Downloads of RPMs and source
packages for the Job Performance (SUPReMM) XDMoD module are available from
[GitHub][github-release]. The ingestion and aggregation
script `aggregate_supremm.sh` **must** be run after the Open XDMoD software has
been upgraded.

Note that if you edited the `application.json` file you will need to re-apply
these edits every time you upgrade as noted on [this page](customization.md).

11.5.0 Upgrade Notes
--------------------

### Database Changes

The `modw_etl` database schema that used to be managed by this module has
now been changed to be managed in the main Open XDMoD software. On upgrade
the `xdmod-upgrade` script will detect the database and prompt to recreate.
You should select the default `[no]` option to skip reinitializing the database.

### Wait Hours by Eligible Time

New "Wait Hours by Eligible Time: Total" and "Wait Hours by Eligible Time: Per Job"
statistics have been added to the Job Performance (SUPReMM) realm. These measure the time
a job waited from when it became eligible to run until it started. Jobs for which the
resource manager does not report an eligible time are excluded from these statistics. The
existing wait statistics have been renamed to "Wait Hours by Submit Time: Total" and
"Wait Hours by Submit Time: Per Job"; their identifiers are unchanged, so saved charts and
API queries continue to work.

The `xdmod-upgrade` script adds the new `eligible_wait_time` column to the
`modw_supremm.job` table and calculates it for existing jobs. The next run of
`aggregate_supremm.sh` then re-aggregates the affected time periods, so it may take
longer than usual.

[github-release]: https://github.com/ubccr/xdmod-supremm/releases/tag/v{{ page.rpm_version }}
