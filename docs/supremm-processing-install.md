
The Job Summarization software should be installed on a server that has
access to the MySQL server for the XDMoD Datawarehouse, either the PCP archives
on disk OR the Prometheus server, and the MongoDB instance.

## Prerequisites

The Job Performance (SUPReMM) XDMoD module must be installed and configured
before configuring the Job Summarization software. See [the XDMoD module install guide](supremm-install.md) for instructions
on this.

A MongoDB database instance must be installed and running. See the [MongoDB install guide](supremm-mongo) for instructions.

## RPM Installation

The RPM package has dependencies that are available in the [EPEL](http://fedoraproject.org/wiki/EPEL)
repository. This repository can be added with this command:

    # dnf install epel-release

It also requires the PCP python libraries, which are included in Rocky 8.

An RPM package for Rocky 8 is [available for download](https://github.com/ubccr/supremm/releases/latest).

    # dnf install supremm-{{ page.summ_sw_version }}-1.el8.x86_64.rpm

## Source Installation

The Job summarization software is written in python and uses [python setuptools](https://setuptools.readthedocs.io/en/latest/)
for package creation. The 1.4 release depends on python 2.7 and the 2.0 release
uses python 3.6. Source code installs are tested in a [conda environment](https://conda.io/docs/user-guide/install/download.html)
and setup as follows.

    $ conda create -n supremm python=[PYTHON VERSION] cython numpy scipy
    $ source activate supremm

where `[PYTHON VERSION]` should be set to 2.7 if using the 1.4 release or 3.6 if using the 2.0 release.

The software is installed as follows:

    $ tar xf supremm-{{ page.summ_sw_version }}.tar.gz
    $ cd supremm-{{ page.summ_sw_version }}
    $ python setup.py install


# Configure Job summarization software

After installing the Job summarization software it must be configured following the instructions in the [configuration guide](supremm-processing-configuration.md).
