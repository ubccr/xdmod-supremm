---
title: Job Summarization Upgrade Guide
---

Check the [software compatibilty tables](supremm-install-overview.md#software-compatibility)
to determine which version of software to upgrade.

## Prerequisites

All periodic cron scripts should be disabled before upgrading the software.

## Upgrade Software

The upgrade procedure involves installing the new software package.

### RPM upgrade

RPMs are provided for Centos 7.6 and Centos 7.7 and are compiled against
the version of PCP that ships with each distribution (PCP version 4.1.0
and 4.3.2 respectively).

    # yum install supremm-{{ page.summ_sw_version }}-1.el7_?.x86_64.rpm

### Source code upgrade

    $ source activate supremm
    $ tar xf supremm-{{ page.summ_sw_version }}.tar.gz
    $ cd supremm-{{ page.summ_sw_version }}
    $ python setup.py install

