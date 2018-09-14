---
title: Software Requirements
---

The Job Performance (SUPReMM) XDMoD module requires all of the software for XDMoD and
the following additional packages:

- [PHP MongoClient][]
- [nodejs][] 6.14.4+

[nodejs]:          https://nodejs.org
[PHP MongoClient]:     http://php.net/manual/en/class.mongoclient.php

Linux Distribution Packages
---------------------------

The Job Performance (SUPReMM) XDMoD module has been tested on Centos 7, but
will likely run on most recent Linux distributions.

### Centos 7

**NOTE**: The package list below includes packages included with
[EPEL](http://fedoraproject.org/wiki/EPEL).  This repository can be
added with this command for CentOS:

    # yum install epel-release

Install the required dependencies:

    # yum install nodejs npm php-pecl-mongo

Additional Notes
----------------

### SELinux

**NOTE**: The webserver is not able to communicate with mongodb with the
default CentOS SELinux security policy. The following command allows the
webserver to communicate over network:

    # setsebool -P httpd_can_network_connect 1
