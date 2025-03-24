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

The RPM package can be downloaded from [GitHub](https://github.com/ubccr/xdmod-supremm/releases/tag/v{{ page.rpm_version }}).

    # dnf install xdmod-supremm-{{ page.rpm_version }}.el8.noarch.rpm

Source Installation
-------------------

The Job Performance (SUPReMM) XDMoD module requires all of the software for XDMoD and
the following additional packages:

- [PHP MongoClient](http://php.net/manual/en/class.mongoclient.php)
- [nodejs](https://nodejs.org) 16.13.2

The source package can be downloaded from
[GitHub](https://github.com/ubccr/xdmod-supremm/releases/tag/v{{ page.rpm_version }}).
Make sure to download `xdmod-supremm-{{ page.sw_version }}.tar.gz`, not the
GitHub-generated "Source code" files.

**NOTE**: The installation prefix must be the same as your existing Open
XDMoD installation. These instructions assume you have already installed
Open XDMoD in `/opt/xdmod-{{ page.sw_version }}`.

```
# tar zxvf xdmod-supremm-{{ page.sw_version }}.tar.gz
# cd xdmod-supremm-{{ page.sw_version }}
# ./install -prefix=/opt/xdmod-{{ page.sw_version }}
```

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

