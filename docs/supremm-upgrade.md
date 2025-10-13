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

[github-release]: https://github.com/ubccr/xdmod-supremm/releases/tag/v{{ page.rpm_version }}
