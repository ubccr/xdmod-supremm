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

If your web server can reach GitHub via HTTPS, you can install the RPM package
directly:

    # dnf install https://github.com/ubccr/xdmod-supremm/releases/download/v{{ page.rpm_version }}/xdmod-supremm-{{ page.rpm_version }}.el8.noarch.rpm

Otherwise, you can download the RPM file from the [GitHub page for the
release](https://github.com/ubccr/xdmod-supremm/releases/tag/v{{
page.rpm_version }}) and install it:

    # dnf install xdmod-supremm-{{ page.rpm_version }}.el8.noarch.rpm

Source Installation
-------------------

The source package can be downloaded from
[GitHub](https://github.com/ubccr/xdmod-supremm/releases/tag/v{{ page.rpm_version }}).
Make sure to download `xdmod-supremm-{{ page.sw_version }}.tar.gz`, not the
GitHub-generated "Source code" files.

**NOTE**: The installation prefix must be the same as your existing Open
XDMoD installation. These instructions assume you have already installed
Open XDMoD in `/opt/xdmod-{{ page.sw_version }}`.

    # tar zxvf xdmod-supremm-{{ page.sw_version }}.tar.gz
    # cd xdmod-supremm-{{ page.sw_version }}
    # ./install --prefix=/opt/xdmod-{{ page.sw_version }}

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

