---
title: SUPReMM Open XDMoD module Upgrade Guide
---

General Upgrade Notes
---------------------

The SUPReMM Open XDMoD module should be upgraded at the same time as the main XDMoD
software. The upgrade procedure is documented on the [XDMoD upgrade
page](http://open.xdmod.org/upgrade.html).

7.5.0 to 7.5.1 Upgrade Notes
----------------------------

This upgrade includes a single bug fix that runs `acl-config` during the
database setup.  If you have 7.5.0 successfully installed and ran `acl-config`
manually then upgrading to 7.5.1 is not necessary.  If you are upgrading to Open
XDMoD 7.0.0 to 7.5.0 then this module may be upgraded directly from 7.0.0 to
7.5.1.

7.0.0 to 7.5.0 Upgrade Notes
----------------------------

For RPM based installs, the file permissions of the XDMoD configuration
files is changed to only permit access for the `xdmod` user account.

If you have configured the summarization scripts to read the database access credentials directly
from the XDMoD configuration files then you must run the scripts with a user account that
has appropriate has access permissions for these files.  For an RPM based install, the `xdmod` user
account has the correct permission.

6.6.0 to 7.0.0 Upgrade Notes
----------------------------

- This upgrade includes config file format changes.
    - New versions of `supremm_resources.json` no longer require a `collection`
      to be specified for each resource.  The appropriate MongoDB collection
      will be determined using the `resource_id`.  Existing
      `supremm_resources.json` files that specify a `collection` will continue
      to work as in previous versions.  No changes are necessary for
      configurations that are compatible with previous versions.

6.5.0 to 6.6.0 Upgrade Notes
----------------------------

- This upgrade includes database schema changes.
    - Modifies `modw_supremm` schema.

6.0.0 to 6.5.0 Upgrade Notes
----------------------------

**Important Note**: This update adds a dependency to npm. If you are updating
an existing installation via RPM, you will need to reinstall npm
dependencies afterward. To do this, run the commands below.

```bash
# Assuming XDMoD's share directory is RPM default "/usr/share/xdmod"

cd /usr/share/xdmod/etl/js
npm install
```

- This upgrade includes database schema changes.
    - Modifies `modw_supremm` schema.
    - Modifies `modw_aggregates` schema.

5.6.0 to 6.0.0 Upgrade Notes
----------------------------

- This upgrade includes config file format changes.
    - Adds an additional option to `portal_settings.d/supremm.ini` to specify the schema definition file for the SUPReMM realm.
