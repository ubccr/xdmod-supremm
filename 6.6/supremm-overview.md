---
title: SUPReMM Overview
redirect_from:
    - "/6.6/"
---

An available Open XDMoD enhancement is SUPReMM (integrated HPC systems usage
and performance of resources monitoring and modeling), which queries system
hardware counters to collect a range of performance information, including
memory usage, filesystem usage, interconnect fabric traffic, and CPU
performance. Typically, this information is acquired at the job’s start in the
prolog, at the job’s end in the epilog, and synchronously across all nodes
periodically. The recommended collection period is every 30 seconds.  SUPReMM
provides a large variety of job performance metrics that give the HPC center
directors and support personnel insight into the performance of all
applications running on the cluster, without the need to recompile end user
applications.
