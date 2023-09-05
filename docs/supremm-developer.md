---
title: Developers Guide
---

The SUPReMM architecture comprises three major components.
   
* Software that runs directly on HPC compute nodes and periodically collects performance information.
* Software that uses the node-level performance data to generate job-level data.
* An Open XDMoD module that enables the job-level information to be viewed and analysed.

The Open XDMoD module is designed to support the ingestion and display of job-level performance data
from a variety of sources including [PCP](http://pcp.io), [Prometheus](https://prometheus.io/), Cray RUR, and [tacc_stats](https://github.com/TACC/tacc_stats).
The recommended data collection software is either PCP or Prometheus. The supported job summarization software is listed below.

### Open XDMoD 

The Open XDMoD core software and the Open XDMoD SUPReMM module source code are hosted on github.
- [Open XDMoD core](https://github.com/ubccr/xdmod)
- [Open XDMoD SUPReMM module](https://github.com/ubccr/xdmod-supremm)

### Summarization Software

The job-level summarization software that processes PCP data is available on github.
- [Job Summarization](https://github.com/ubccr/supremm)

### PCP Software

- [PCP community page](http://pcp.io/community.html)

### Prometheus

- [Prometheus community page](https://prometheus.io/community/)
