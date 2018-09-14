---
title: Software Install and Upgrade
---

The software stack involves three different components all of which must
be installed and configured

1. PCP Data collection software
1. Job Performance (SUPReMM) XDMoD module
1. Summarization software

Software Compatibility
----------------------

The Job Performance (SUPReMM) XDMoD module version number must be
identical to the version of the base XDMoD install. The versions of the 
summarization software and PCP software for a given XDMoD version are listed
below.

### Open XDMoD 8.0.0

<table>
<thead>
<tr>
<th>Package</th> <th>Recommended Version</th> <th>Compatible Version(s)</th>
</tr>
</thead>
<tbody>
<tr>
<td> Job Summarization </td><td align="right"> 1.1.0               </td><td align="right"> 1.1.x </td>
</tr>
<tr>
<td> PCP               </td><td align="right"> 3.12.2              </td><td align="right"> 3.11.x - 3.12.x </td>
</tr>
</tbody>
</table>
<br />

The SUPReMM software has been tested with MongoDB version 3.4.15. We expect
that the software is compatible with any supported release version of MongoDB.
