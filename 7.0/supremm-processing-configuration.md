---
title: Job Summarization Configuration Guide
---

Setup Script
------------

The SUPReMM software includes a setup script to help you configure your
installation. The script will prompt for information needed to configure the
software and update the configuration files and databases. If you have
modified your configuration files manually, be sure to make backups before
running this command:

    # supremm-setup

The setup script needs to be run as a user that has write access to the
configuration files. You may either specify a writable path name when prompted
(and then manually copy the generated configuration files) or run the script as
the root user.

The setup script has an interactive ncurses-based menu-driven interface. A description of
the main menu options is below:

### Create configuration file

This section prompts for the configuration settings for the XDMoD datawarehouse
and the MongoDB database. The script will automatically detect the resources
from the XDMoD datawarehouse and prompt for the settings for each of them.

### Create database tables

This section will create the database tables that are needed for the job summarization software.

The default connection settings are read from the configuration file (but can
be overridden). It is necessary to supply username and password of a
database user account that has CREATE privileges on the XDMoD modw_supremm database.

### Initialize MongoDB Database

This section will add the required data to the MongoDB database.

The default connection settings are read from the configuration file (but can
be overridden).

Configuration Guide
-------------------

The SUPReMM job summarization software is configured using a json-style format
file that uses json syntax but permits line-based comments (lines starting with
`//` are ignored by the parser).

This file is stored in `/etc/supremm/config.json` for RPM based installs or
under `[PREFIX]/etc/supremm/config.json` for source code installs, where
`[PREFIX]` is the path that was passed to the install script.

The paths shown in this configuration guide show the default values for
RPM-based installs.  For source code installs you will need to adjust the paths
in the examples to match the installed location of the package.

Resource settings
-----------------
The "my_cluster_name" string and value of the `resource_id` field should be set to
the same values as the `code` and `id` columns in the Open XDMoD
modw.resourcefact table in the datawarehouse.

The `pcp_log_dir` field should be set to the path to the PCP node-level
archives. If the job scheduler is configured to store a copy of each job batch
script, then the `script_dir` field should be set to the path to the directory
that contains the job batch scripts. If the job batch scripts are not
available, then the `script_dir` field should be set to an empty string.

    {
        ...
        "resources": {
            "my_cluster_name": {
                "enabled": true,
                "resource_id": 1,
                "batch_system": "XDMoD",
                "hostname_mode": "hostname",
                "pcp_log_dir": "/data/pcp-logs/my_cluster_name",
                "script_dir": "/data/jobscripts/my_cluster_name"
            }
        }
    }

MongoDB settings
----------------

The `outputdatabase`.`uri` should be set to the uri of the MongoDB server that
will be used to store the job level summary documents.  The uri syntax is
described in the [MongoDB documentation][]. You must specify the database name in
the connection uri string in addition to specifying it in the `dbname` field

    {
        ...
        "outputdatabase": {
            "type": "mongodb",
            "uri": "mongodb://localhost:27017/supremm",
            "dbname": "supremm"
        },
        ...
    }

[MongoDB documentation]:        https://docs.mongodb.org/manual/reference/connection-string/

Database authentication settings
--------------------------------

The configuration file supports two different mechanisms to specify the access
credentials for the Open XDMoD datawarehouse. **Choose one of these options.** Either:
1. Specify the path to the Open XDMoD install location (and the code will use the Open XDMoD configuration directly) or
2. Specify the location and access credentials directly.

If the summarization software is installed on the same machine as Open XDMoD then (1) is the recommended option. Otherwise use option (2).

### Option (1) XDMoD path specification ###

If the summarization software is installed on the same machine as Open XDMoD
then ensure the `config.json` has the following settings:

    {
        ...
        "xdmodroot": "/etc/xdmod",
        "datawarehouse": {
            "include": "xdmod://datawarehouse"
        },
        ...
    }

Where xdmodroot should be set to the location of the xdmod configuration
directory, typically `/etc/xdmod` for RPM based installs.

### Option (2) Direct DB credentials ###

If the summarization software is installed on a dedicated machine (separate
from the Open XDMoD server), then the XDMoD datawarehouse location and access credentials
should be specified as follows:

Create a file called `.supremm.my.cnf` in the home directory of the user that
will run the job summarization software. This file must include the username
and password to the Open XDMoD datawarehouse mysql server:

    [client]
    user=[USERNAME]
    password=[PASSWORD]

ensure the "datawarehouse" section of the `config.json` file has settings like
the following, where *XDMOD\_DATABASE\_FILL\_ME\_IN* should be set to the hostname of
the XDMoD database server.

    {
        ...
        "datawarehouse": {
            "db_engine": "MySQLDB",
            "host": "XDMOD_DATABASE_FILL_ME_IN",
            "defaultsfile": "~/.supremm.my.cnf"
        },
        ...
    }


Setup the Database
-------------------

The summarization software uses relational database tables to keep track of
which jobs have been summarized, when and which version of the software was
used. These tables are added to the `modw_supremm` schema that was created when
the Open XDMoD SUPReMM module was installed.  The database creation script is
located in the `/usr/share/supremm/setup` directory and should be run on the
XDMoD datawarehouse DB instance.

    $ mysql -u root -p < /usr/share/supremm/setup/modw_supremm.sql


Setup MongoDB
-----------

    $ mongo [MONGO CONNECTION URI] /usr/share/supremm/setup/mongo_setup.js

where [MONGO CONNECTION URI] is the uri of the MongoDB database.

Run the indexer script:
-----------------------

The archive indexer script scans the PCP archive directory that is specified
in the configuration file, parses the PCP archive and stores the archive metadata in
the database. This index is then used by the job summarization script to quickly
obtain the list of archives for each job.

The archive indexer script by default uses archive file name to only process
archives that were created in the last N days.  The first time the archive
indexer is run, specify the "-a" flag to get it to processes all archives.  It
is also recommended to specify the debug output flag -d so that you can see
that it is processing the files:

    $ /usr/bin/indexarchives.py -a -d

Run the summarization script:
-----------------------------

    $ /usr/bin/summarize_jobs.py -d

You should see log messages indicating that the jobs are being processed. You
can hit CTRL-C to stop the process.  The jobs that have been summarized by the
script will be marked as processed in the database and the summaries should end
up in MongoDB. Check to see that the summaries are in MongoDB by, for example, using
the MongoDB command line client to query the database:

    $ mongo [MONGO CONNECTION URI]
    > var cols = db.getCollectionNames();
    > for(var i=0; i < cols.length; i++) {
          print(cols[i], db[cols[i]].count())
      }


Deploy SUPReMM in Production
--------------------------------

Enable the following script to run everyday via a cron job.  It should be executed
after the Open XDMoD daily update process is expected to finish.

    $ /usr/bin/supremm_update

This script calls indexarchives.py and summarize_jobs.py in turn while providing a
locking mechanisms so that processes do not conflict with each other.
