The Job Performance (SUPReMM) XDMoD module should be installed on an existing XDMoD
instance.  The XDMoD instance must have job accounting data shredded and
ingested and present in the UI. **Do not begin the configuration steps until the
accounting data is loaded into XDMoD**.  See the [main XDMoD
documentation](https://open.xdmod.org) for instructions on installing and
configuring XDMoD.

If you have a previous version of the SUPReMM module installed, then
follow the instructions in the [Upgrade Guide](supremm-upgrade.html).

RPM Installation
----------------

An RPM package for Rocky 8 is [available for download](https://github.com/ubccr/xdmod-supremm/releases/tag/{{ page.sw_version }}-1).

    # dnf install xdmod-supremm-{{ page.sw_version }}-1.el8.noarch.rpm

Source Installation
-------------------

The Job Performance (SUPReMM) XDMoD module requires all of the software for XDMoD and
the following additional packages:

- [PHP MongoClient][]
- [nodejs][] 16.13.2

[nodejs]:          https://nodejs.org
[PHP MongoClient]:     http://php.net/manual/en/class.mongoclient.php

    $ tar zxvf xdmod-supremm-{{ page.sw_version }}.tar.gz
    $ cd xdmod-supremm-{{ page.sw_version }}
    # ./install -prefix=/opt/xdmod

**NOTE**: The installation prefix must be the same as your existing Open
XDMoD installation. These instructions assume you have already installed
Open XDMoD in `/opt/xdmod`.

Additional Notes
----------------

### SELinux

**NOTE**: The webserver is not able to communicate with MongoDB with the
default Rocky Linux SELinux security policy. The following command allows the
webserver to communicate over network:

    # setsebool -P httpd_can_network_connect 1

Configure SUPReMM module
------------------------

After installing the XDMoD module it must be configured following the 
instructions in the [Job Performance (SUPReMM) XDMoD Module Configuration Guide](supremm-configuration.html).

