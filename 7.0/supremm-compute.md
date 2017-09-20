---
title: Data collection software install and configuration
---

The PCP software is installed on each compute node and is configured so that data are collected:

* At the start of every job
* 10, 20 and 30 seconds after job start
* Periodically during the job (recommmended 30 seconds)
* At the end of every job

The archive data for each node are stored on a shared filesystem for
subsequent processing by the job summarization software.

Instructions
------------

* [PCP install and configuration](supremm-compute-pcp.html)
* [SLURM configuration](supremm-compute-slurm.html)
