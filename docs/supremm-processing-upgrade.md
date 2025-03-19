---
title: Job Summarization Upgrade Guide
---

Check the [software compatibilty tables](supremm-install-overview.md#software-compatibility)
to determine which version of software to upgrade.

## Prerequisites

All periodic cron scripts should be disabled before upgrading the software.

## Upgrade Software

The upgrade procedure involves installing the new software package. An RPM is
provided for Rocky 8 and is compiled against the version of PCP that ships with
the distribution (PCP version 5.3.7).

    # dnf install supremm-{{ page.summ_sw_version }}-1.el8.x86_64.rpm

### Source code upgrade

    $ source activate supremm
    $ tar xf supremm-{{ page.summ_sw_version }}.tar.gz
    $ cd supremm-{{ page.summ_sw_version }}
    $ python setup.py install

