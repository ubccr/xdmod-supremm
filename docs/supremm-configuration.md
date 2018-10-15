This guide explains how to configure the Job Performance (SUPReMM) XDMoD module.

## Prerequisites

Ensure that [Open XDMoD](http://open.xdmod.org) is installed and configured
correctly and the [shredder](http://open.xdmod.org/shredder.html) and
[ingestor](http://open.xdmod.org/ingestor.html) scripts have been run
successfully before configuring the SUPReMM module.  **Do not begin the
configuration steps until the accounting data is loaded into XDMoD**.

Double check that that the `timezone` and `shared_jobs` configuration settings
in the `resources.json` configuration file are correct for the resources that have performance data. These settings are
documented in the [main configuration guide](https://open.xdmod.org/{% if page.version %}{{page.version}}/{% endif %}configuration.html#resourcesjson)
The `timezone` setting determines the timezone of time data displayed in the XDMoD Job Viewer tab. The
`shared_jobs` setting determines whether the accounting data will be processed to check
for jobs that share compute nodes.

## Configuration

The Job Performance (SUPReMM) XDMoD module adds an additional main menu item
to the XDMoD interactive setup software. Run the script as follows:

    # xdmod-setup

and select the 'SUPReMM' option in the main menu. The `xdmod-setup` script usage is described below. 

The next step after configuring in the XDMoD module is to install and configure the [job summarization software](supremm-processing-install.md).

The `xdmod-setup` script
------------------------

`xdmod-setup` is an interactive setup script for XDMoD. After installing the xdmod-supremm module, there will be an
additional option titled  "SUPReMM" in the main menu.  Select that option to show the SUPReMM
module configuration menu. The options in the menu are listed below:

### Setup database

This option creates the necessary SUPReMM-module specific database schemas
and tables in the XDMoD datawarehouse. You will
need to provide the credentials for your MySQL root user, or another
user that has privileges to create databases.  Two database schemas will be
created, `modw_etl` and `modw_supremm`.  The database user that is
specified in your `portal_settings.ini` will be granted access to these
databases.

In addition to the databases, the setup script will also install the
necessary Node.js packages that are required. (The list of required packages
can be found on the [license notices page][notices].) If you prefer to install
these packages manually, you may do so with the following commands:

    # cd /usr/share/xdmod/etl/js
    # npm install

The script also prompts for the location of the document database that
contains the job summary data. I.e. the MongoDB instance. Enter the uri
in the standard MongoDB connection string format (see the [mongo documentation][] for
the syntax).  **You must specify the database name in the connection URI.** If
the database is not specified then the MongoDB driver defaults to the 'test'
database, which will not contain the job summary data. The default database name is 'supremm'
so, for example, if you have installed the MongoDB on the same server as XDMoD then you would use
the following uri:

    mongodb://localhost:27017/supremm

The script also runs the `acl-config` command that is used to update the access controls in
XDMoD.  If you prefer to run this command manually use the following command

    # acl-config

The `acl-config` command is documented in the [XDMoD command reference][commands].

### Configure resources

The setup script automatically detects the existing resources in the XDMoD datawarehouse and lists them.
If no "Edit resource" options show in the list then quit the setup and complete the steps listed in the
[shredder][] and [ingestor][] guides before re-running the setup script.

By default all the resources are disabled. You must select the "Edit
resource" option for each resource that you wish to configure to appear in the
SUPReMM realm and follow the prompt to enable the resource and set the correct
options. The "Dataset mapping" should be set to 'pcp' if processing job summaries
generated from PCP data. 

SUPReMM configuration files
---------------------------

The SUPReMM module configuration files are located in the `etc` directory of
the installation prefix or `/etc/xdmod` for the RPM distribution.

### supremm_resources.json

Defines all of the resources that have Job Performance data that will be ingested and
displayed in XDMoD. Each object in the array represents the configuration for a
single resource. All resources listed in this file must also have entries in
the `resources.json` and `resource_specs.json` main configuration files
(described in the [main configuration guide](http://open.xdmod.org/configuration.html)).

```json
{
    "resources": [
        {
            "resource": "resource1",
            "resource_id": 1,
            "enabled": true,
            "datasetmap": "pcp",
            "hardware": {
                "gpfs": ""
            }
        }
    ]
}
```

The value of the `resource` parameter should be identical to the `resource`
parameter in the `resources.json` main configuration file.

The value of the `resource_id` must be the id of the resource in the XDMoD
datawarehouse. This value is obtained automatically by the interactive setup
script. It can be manually obtained by running the following SQL query:

```sql
mysql> SELECT id FROM `modw`.`resourcefact` WHERE code = "%resource%";
```

where `%resource%` should be replaced with the `resource` parameter from the
`resources.json` main configuration file.

The `datasetmap` option allows the ingestion of Job Performance data from different
data sources. Currently PCP is the only supported data source.

The `hardware` property is used by the dataset mapping code to process PCP
metrics that have device-specific names. The only configurable mapping
in this release is the name of the GPFS mount point. If the resource has
a GPFS filesystem then set `hardware.gpfs` to the name of the GPFS mount point.
Set this to an empty string if there is no GPFS filesystem for the resource.

### portal_settings.d/supremm.ini

Contains the configuration settings to allow XDMoD to connect to the job summary document
database. The only supported db_engine is MongoDB.

```ini
[jobsummarydb]

db_engine = "MongoDB"
uri = "mongodb://localhost:27017/supremm"
db = "supremm"
```

The uri syntax is described in the [mongo documentation][]. **You must specify
the database name in the connection URI.** If the database is not specified then
the MongoDB driver defaults to the 'test' database, which will not contain the
job summary data.

Advanced Configuration Options
---------------------------

The resource configuration file `supremm_resources.json` has optional advanced
configuration settings for each resource.

The `$.resources[*].collection` option overrides the collection name in the
MongoDB. This option can be used to set a non default collection name.

The `$.resources[*].db` option specifies the name of the section in the
portal_settings file that contains the database configuration settings. This
setting can be used to support an XDMoD instance ingesting data from multiple
MongoDB databases.



[mongo documentation]:        https://docs.mongodb.org/manual/reference/connection-string/
[commands]:                   http://open.xdmod.org/commands.html
[shredder]:                   shredder.md
[ingestor]:                   ingestor.md
[notices]:                    supremm-notices.md
