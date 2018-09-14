---
title: Job Summarization Upgrade Guide
---

Check the [software compatibilty tables](supremm-softwarecompat.md#software-compatibility)
to determine which version of software to upgrade.

## Prerequisites

All periodic cron scripts should be disabled before upgrading the software.

## Upgrade Software

The upgrade procedure involves installing the new software package and then running
an upgrade script.

### RPM upgrade

    # yum install supremm-{{ page.summ_sw_version }}-1.x86_64.rpm

### Source code upgrade

    $ source activate supremm
    $ tar xf {{ page.summ_sw_version }}.tar.gz
    $ cd {{ page.summ_sw_version }}
    $ python setup.py install

## Upgrade Database Schema

    # supremm-upgrade


