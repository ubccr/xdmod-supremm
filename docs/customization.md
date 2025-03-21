---
title: Customization
---

This document describes some advanced customizations for the Job Performance module.

**The automated upgrade scripts do not have any support for preserving
customizations. Any changes made to the underlying Open XDMoD source code
will likely be overwritten when the software is upgraded.**

## Job Analytics

The job analytics panel shows selected job performance metrics in color
coded plots across the top of the job tab in the Job Viewer. The value of
each metric in the panel is normalized so a value near 1 means a favourable
value and a value near 0 indicates an unfavourable value.

There are five default analytics. These are the CPU Usage,
CPU Balance, Walltime Accuracy, Memory Efficiency and Homogeneity, see Figure 1
below. If the CPU Usage metric is unavailable then the analytics toolbar is not displayed.
If any of the other metrics are unavailable then an error message is displayed.

<figure>
<img src="{{ site.baseurl }}/assets/images/analytics_with_five.png" alt="Screenshot of the analytics toolbar. The toolbar has five different boxes arranged in a line. Each box shows a performance metric name, metric value and a bar plot that also indicates the value." />
<figcaption>Figure 1. Example screenshot of the analytics toolbar.</figcaption>
</figure>

A common reason why an analytic is unavailable is that the underlying data was not collected
when the job was running. For example, the homogeneity analytic uses the L1D load count and
CPU clock tick counter hardware counter data. If the hardware counter data were not configured
to be collected or the hardware does not support a L1D load counter then the homogeneity
metric will be unavailable. An example of the display in this case is shown in Figure 2.

<figure>
<img src="{{ site.baseurl }}/assets/images/analytics_unavailable.png" alt="Screenshot showing a performance metric from the analytics toolbar where the performance datum is unavailable. The metric display shows an exclamation mark icon with the text 'Metric Missing: Not Available On The Compute Nodes'" />
<figcaption>Figure 2. Example analytics metric display when the datum is unavailable.</figcaption>
</figure>

If an analytic will always be unavailable (for example, due to the absence of
hardware support), then the Open XDMoD instance can be customized to never show it.

**This customization will not be preserved if the Open XDMoD software is updated.**

**These instructions only apply to Open XDMoD {{ page.sw_version }}. For other
versions please refer to the documentation for that release.**

To remove an analytic you need to edit `/usr/share/xdmod/classes/DataWarehouse/Query/SUPREMM/JobDataset.php`
and remove the code associated with the analytic. For example to remove the homogeneity
analytic you would remove (or comment out) lines 330-346, i.e., the function call to `addFieldWithError` and the
update to the documentation object. The lines to remove are shown below.
```php
330         $this->addFieldWithError(
331             new FormulaField("(1.0 - (1.0 / (1.0 + 1000.0 * jf.catastrophe)))", "homogeneity"),
332             'catastrophe',
333             $joberrors,
334             'homogeneity_error'
335         );
336         $this->documentation['homogeneity'] = array(
337             'name'=> 'Homogeneity',
338             'units' => 'ratio',
339             'per' => 'job',
340             'visibility' => 'public',
341             'documentation' => 'A measure of how uniform the L1D load rate is over the lifetime of the job.
342                                 Jobs with a low homogeneity value (~0) should be investigated to check if there
343                                 has been a catastrophic failure during the job',
344             'batchExport' => true,
345             'dtype' => 'analysis'
346         );
```
