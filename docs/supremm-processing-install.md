---
title: Job summarization software installation guide
---

This guide will outline how to install the Job summarization software.

## Prerequisites

The Job Performance (SUPReMM) XDMoD module must be installed and configured
before configuring the Job Summarization software. See [the XDMoD module install guide](supremm-install.md) for instructions
on this.

A MongoDB database instance must be installed and running. See the [MongoDB install guide](supremm-mongo) for instructions.

## RPM Installation

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
