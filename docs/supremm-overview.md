---
title: Job Performance Data Overview
redirect_from:
    - ""
---

XDMoD is able to display detailed HPC job performance data via an optional
module and some accompanying software. The software is capable of reporting a
wide range of Job-level performance information, including memory usage, filesystem
usage, interconnect fabric traffic, and CPU performance. The data are available
in aggregate form in the metric explorer and usage explorer tabs in the XDMoD
user interface. Detailed information about individual jobs are available in the
Job Viewer tab. An example screenshot of the Job Viewer is shown in Figure 1. below.
This illustrates viewing the memory usage of each of the compute nodes of an HPC job over
time. Example aggregate plot data is shown in Figures 2 and 3. These show a breakdown
of the CPU core hours by application (determined by sampling the running processes)
and total jobs by CPU usage respectively.

<img src="{{ site.baseurl }}/assets/images/job_viewer.png" width="623" height="360" alt="Example screenshot of the XDMoD Job Viewer tab" />

*Figure 1. Example screenshot of the XDMoD Job Viewer tab. The Job Viewer displays detailed statistics on job performance metrics
and timeseries plots for selected metrics.*

<img src="{{ site.baseurl }}/assets/images/xdmod_CPU_Hours_by_Application_2018-05-29_to_2018-08-27.svg" width="457" height="242" alt="Pie chart
showing CPU core hours grouped by the application." />

*Figure 2. Example XDMoD plot
showing CPU core hours grouped by the application that the job ran. The application information is inferred from
the names of processes run by the job.*

<img src="{{ site.baseurl }}/assets/images/xdmod_Number_of_Jobs_by_CPU_usage_2018-05-29_to_2018-08-27.svg" width="365" height="193" alt="Bar
plot showing number of jobs binned by their average CPU usage." />

*Figure 3. Example XDMoD plot showing the number of jobs binned by the average CPU usage of the job.*

This documentation is intended to be used by system administrators to install and configure
the generation and display of Job Performance data in XDMoD. If you are an end user looking for
help using XDMoD, the starting point is the 'Help' button on right hand side of the top toolbar
in the web interface.

