---
title: SUPReMM Open XDMoD module Upgrade Guide
---

General Upgrade Notes
---------------------

The SUPReMM Open XDMoD module should be upgraded at the same time as the main XDMoD
software. The upgrade procedure is documented on the [XDMoD upgrade
page](http://open.xdmod.org/upgrade.html).

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
