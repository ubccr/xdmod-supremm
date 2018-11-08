---
title: SUPReMM Upgrade overview
---

This page describes the steps necessary to upgrade an existing XDMoD instance that
already has Job Performance data. See the [install overview](supremm-install-overview.md) page
for instructions for a fresh install.

## Prerequisites

Upgrades to a new version are only supported from the version that directly
precedes it. If you need to upgrade from an older version you must upgrade
through all the intermediate versions or perform a clean installation.

Check the [software compatibilty tables](supremm-install-overview.md#software-compatibility)
for the recommended versions of the various components.

**NOTE:** that the Job Summarization software must be upgraded to 1.1.0 to be compatible with XDMoD 8.0.0.

General Upgrade Notes
---------------------

We recommend upgrading the software components in the following order:
1. [Open XDMoD](supremm-upgrade.md)
1. [Job Summarization](supremm-processing-upgrade.md)
1. Data Collection
