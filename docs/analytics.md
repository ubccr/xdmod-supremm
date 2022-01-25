---
title: Customizing Efficiency Tab Analytics
---

This document describes how to customize the text displayed when viewing the analytics in the Efficiency Tab.

**The automated upgade scripts do not have any support for preserving
customizations. Any changes made to the underlying Open XDMoD source code
will likely be overwitten when the software is upgraded.**

## Efficiency Analytics

The efficiency analytics are shown when you first navigate to the efficiency tab. With each analytic, 
there is associated text explaining what the analytic is, what is considered inefficient in regards to the analytic, and 
supporting text giving suggestions of how to improve efficiency regarding a specfic analytic. 

As of the 10.0 release, there are six analytics. These are CPU Usage, GPU Usage, Memory Headroom, Homogeneity, Wall Time Accuracy, and Short Job Count. When you first navigate to the efficiency tab, you will see cards each representing an analytic. Each card includes a brief description of the analytic as well as a scatter plot that allows you to visualize how users rank in each analytic (see Figure 1 below).

<figure>
<img src="{{ site.baseurl }}/assets/images/efficiency_tab.png" alt="Screenshot of the initial view when first navigating to the efficiency tab. The view shows six cards broken down into two categories - one for usage analytics which includes CPU Usage, GPU Usage, Memory Headroom and Homogeneity and one for design analytics which includes Wall Time Accuracy and Short Job Count. Each card displays a short description of the analytic and a thumbnail view of the scatter plot related to that analytic. The scatter plot points represent a user's usage on the resource and efficiency of their jobs for the specific analytic." />
<figcaption>Figure 1. Example screenshot of inital view when navigating to the efficiency tab.</figcaption>
</figure>

Upon clicking on one of the analytic cards, a user will be shown a larger view of the scatter plot that they can interact with by filtering or drilling down. In this view, more text is presented to give more information about the specfic analytic and how efficiency may be improved for that analytic. Figure 2 below shows this view for CPU Usage. In this image, you can see the help text at the top of the image above the scatter plot. The associated help text shown in this view can be customized as needed for different centers. 

<figure>
<img src="{{ site.baseurl }}/assets/images/cpu_usage.png" alt="Screenshot of the scatter plot view for CPU Usage in the efficiency tab. Each analytic from the initial efficiency tab page can be viewed in more detail by clicking on the analytic card. This view shows the same scatter plot from the analytic card, but the scatter plot can be filtered or drilled down to learn more information about the users and their respective jobs represented by the scatter plot points. In addition to the scatter plot, there is a side bar that allows filtering and above the scatter plot is the help text explaining the analytic in more detail and giving more information on how to improve efficiency in regard to this analytic." />
<figcaption>Figure 2. Example of CPU Usage scatter plot and corresponding help text.</figcaption>
</figure>

You may want to customize this text to provide more focused feedback for users at your center or provide links to help text as appropriate. To do so, please follow the directions provided below.

**This customization will not be preserved if the Open XDMoD software is updated.**

**These instructions only apply to Open XDMoD 10.0. This change will not work on earlier versions of Open XDMoD. For later
versions please refer to the documentation for that release.**

To customize text for an analytic you need to edit the `/etc/xdmod/efficiency_analytics.json` configuration file. For example, to edit the help text for the CPU Usage analytic you would edit the html that is under "documentation" in lines 30-37. The lines to edit are shown below.
```json
29      "documentation": [
30          "<div class='text'>",
31          "<h6> What is this analytic? </h6>",
32          "<p>A measure of the ratio of idle core cycles to total cycles.</p>",
33          "<h6> Why is this analytic important? </h6>",
34          "<p> The requested core cycles are not being used on the resource and could be used by other jobs.</p>",
35          "<h6> How do I improve future jobs? </h6>",
36          "<p> Give actions here that users can follow to improve this behavior in future jobs. </p>",
37          "</div>"
        ],
```

 For editing help text for other analytics, the process is the same, but you need to change the "documentation" that corresponds to that specific analytic. Below is a list of lines that need changed for each analytic. 
 **GPU Usage:** lines 71-78
 **CPU Usage:** lines 30-37
 **GPU Usage:** lines 71-78
 **Memory Headroom:** lines 112-119
 **Homogeneity:** lines 153-160
 **Wall Time Accuracy:** lines 200-207
 **Short Job Count:** lines 242-249
