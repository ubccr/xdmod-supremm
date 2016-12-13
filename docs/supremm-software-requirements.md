---
title: Software Requirements
---

The SUPReMM Open XDMoD module requires all of the software for Open XDMoD and
the following additional packages:

- [PHP][] 5.3+
    - [MongoClient][]
- [nodejs][] 0.10+

[php]:             http://php.net/
[nodejs]:          https://nodejs.org
[MongoClient]:     http://php.net/manual/en/class.mongoclient.php

Linux Distribution Packages
---------------------------

The Open XDMoD SUPReMM module can be run on most recent Linux distributions, but has
been tested on CentOS 6 and Centos 7.

The SUPReMM module requirements can be met using packages from the EPEL repository.

### CentOS 6 / Centos 7

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
