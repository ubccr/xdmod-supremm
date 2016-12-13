---
title: SUPReMM Integration RPM Installation Guide
---

Install RPM Package
----------------------

    # yum install xdmod-supremm-x.x.x-x.x.*.noarch.rpm

Configure SUPReMM module
------------------------

See the [Configuration Guide](supremm-configuration.html) for details.

Check Open XDMoD Portal
-----------------------

After successfully installing and configuring the SUPReMM package you
should check the Open XDMoD portal to make sure everything is working
correctly.  By default, the SUPReMM data is only available to authorized
users, so you must log into the portal.  After logging in there should
an additional tab visible named "Job Viewer".  In addition to the new
tab, the "SUPREMM" realm should be visible in the "Usage" and "Metric
Explorer" tabs.

Note that the admin user that was created in the Open XDMoD does not have a
user role by default and therefore cannot view SUPReMM data. If you login to
XDMoD using the admin user account you will see a popup dialog box with the
error message "Job Viewer: The Quick Job Lookup resource list failed to load.
(The role to which you are assigned does not have access to the information you
requested.)". If you try to select SUPReMM realm data in the Usage tab then you
should see an "access denied" message box. These messages should not be seen
when accessing the portal using a normal account that has user role.  If
desired, a user role can be added to the admin account using the "User
Management" tab in the XDMoD Dashboard.
