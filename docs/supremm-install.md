---
title: Installation Guide
---

The Job Performance (SUPReMM) XDMoD module should be installed on an existing XDMoD
instance.  The XDMoD instance must have job accounting data shredded and
ingested and present in the UI. **Do not begin the configuration steps until the
accounting data is loaded into XDMoD**.  See the [main XDMoD
documentation](https://open.xdmod.org) for instructions on installing and
configuring XDMoD.

If you have a previous version of the SUPReMM module installed, then
follow the instructions in the [Upgrade Guide](supremm-upgrade.html)

RPM Installation
----------------

An RPM package for Centos 7 are [available for download](https://github.com/ubccr/xdmod-supremm/releases/latest).

    # yum install xdmod-supremm-{{ page.sw_version }}-1.0.noarch.rpm

Source Installation
-------------------

    $ tar zxvf xdmod-supremm-{{ page.sw_version }}.tar.gz
    $ cd xdmod-supremm-{{ page.sw_version }}
    # ./install -prefix=/opt/xdmod

**NOTE**: The installation prefix must be the same as your existing Open
XDMoD installation. These instructions assume you have already installed
Open XDMoD in `/opt/xdmod`.

Configure SUPReMM module
------------------------

After installing the XDMoD module it must be configured following the 
instructions in the [XDMoD Module Configuration Guide](supremm-configuration.html).

