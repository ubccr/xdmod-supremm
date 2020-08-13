
The Job Summarization software should be installed on a server that has
access to the MySQL server for the XDMoD Datawarehouse, the PCP archives
and the MongoDB instance.

## Prerequisites

The Job Performance (SUPReMM) XDMoD module must be installed and configured
before configuring the Job Summarization software. See [the XDMoD module install guide](supremm-install.md) for instructions
on this.

A MongoDB database instance must be installed and running. See the [MongoDB install guide](supremm-mongo) for instructions.

## RPM Installation

The RPM package has dependencies that are available in the [EPEL](http://fedoraproject.org/wiki/EPEL)
repository. This repository can be added with this command for CentOS:

    # yum install epel-release

It also requires the PCP rpms provided by the [PCP project](https://pcp.io). The yum repository setup information
is available on the [pcp packages page](https://bintray.com/pcp/).

An RPM package for Centos 7 is [available for download](https://github.com/ubccr/supremm/releases/latest)

    # yum install supremm-{{ page.summ_sw_version }}-1.x86_64.rpm

## Source Installation

The Job summarization software is written in python 2.7 and uses [python setuptools](https://setuptools.readthedocs.io/en/latest/) 
for package creation. Source code installs are tested in a [conda environment](https://conda.io/docs/user-guide/install/download.html)
and setup as follows.

    $ conda create -n supremm python=2.7 cython numpy scipy
    $ source activate supremm

The software is installed as follows:

    $ tar xf {{ page.summ_sw_version }}.tar.gz
    $ cd {{ page.summ_sw_version }}
    $ python setup.py install


# Configure Job summarization software

After installing the Job summarization software it must be configured following the instructions in the [configuration guide](supremm-processing-configuration.md).
