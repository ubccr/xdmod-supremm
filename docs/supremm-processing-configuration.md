
This guide explains how to configure the Job Summarization software.

## Prerequisites

The Job Performance (SUPReMM) XDMoD module must be [installed](supremm-install.md) and [configured](supremm-configuration.md)
before configuring the Job Summarization software.

Setup Script
------------

The Job Summarization software includes a setup script to help you configure your
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

This section will add required data to the MongoDB database.

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

The top level properties are listed in the table below:

<table>
<thead>
<tr>
<th>Setting</th> <th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>summary</code></td><td>Contains configuration settings for the <code>summarize_jobs.py</code> script.</td>
</tr>
<tr>
<td><code>resources</code></td><td>Contains details about the compute resources.</td>
</tr>
<tr>
<td><code>datawarehouse</code></td><td>Contains configuration to access XDMoD's database.</td>
</tr>
<tr>
<td><code>outputdatabase</code></td><td>Contains configuration settings for the database used to store the job summary data.</td>
</tr>
<tr>
<td><code>xdmodroot</code></td><td>This optional setting defines the path to the XDMoD configuration directory. This
is only used if the summarization software runs on the same machine as the XDMoD software is installed. If present
then the software will read the XDMoD database configuration directly from the XDMoD portal settings file. This
obviates the need to redundantly specify database settings.</td>
</tr>
</tbody>
</table>

Summary settings
-------------------

The `summary` element contains configuration for the `summarize_jobs.py` script.

```json
{
    ...
    "summary": {
        "archive_out_dir": "/dev/shm/supremm_test",
        "subdir_out_format": "%r/%j"
    }
}
```

<table>
<thead>
<th>Setting</th> <th>Example value</th> <th>Description</th>
<tr><td><code>archive_out_dir</code></td><td><code>/dev/shm/supremm</code></td><td>Path to a directory that is used
to store temporary files. The summary script will try to create the directory if is does not exist.
The default value is to use a path under <code>/dev/shm</code> because this is
the typical location of a <code>tmpfs</code> filesystem. The summarization software performance
is typically improved by using <code>tmpfs</code> for temporary files but this is not required.</td></tr>
<tr><td><code>subdir_out_format</code></td><td><code>%r/%j</code></td><td>Specifies the path under
the <code>archive_out_dir</code> to be used for temporary files during the summarization of each job.
Different subdirectories should used for each job because jobs are processed in parallel.
The format string includes the following substitutions:  <code>%r</code> is replaced by the resource name
and <code>%j</code> the job identifier. Additionally any valid format specifiers to the <code>strftime</code> function
are permitted. The <code>strftime</code> function is called with
the end time of the job.</td></tr>
</thead>
<tbody>
</tbody>
</table>

Resource settings
-----------------
The "my_cluster_name" string and value of the `resource_id` field should be set to
the same values as the `code` and `id` columns in the Open XDMoD
modw.resourcefact table in the datawarehouse.


```json
{
    ...
    "resources": {
        "my_cluster_name": {
            "enabled": true,
            "resource_id": 1,
            "batch_system": "XDMoD",
            "hostname_mode": "hostname",
            "pcp_log_dir": "/data/pcp-logs/my_cluster_name",
            "batchscript": {
                "path": "/data/jobscripts/my_cluster_name",
                "timestamp_mode": "start"
            }
        }
    }
}
```

The various settings are described in the table below:
<table>
<thead>
<tr>
<th>Setting</th> <th>Allowed values</th> <th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>enabled</code></td><td><code>true</code> | <code>false</code></td><td>If set to <code>false</code> then this resource will be ignored by the software</td>
</tr>
<tr>
<td><code>resource_id</code></td><td>[integer]</td><td>The value from the <code>id</code> column in the <code>modw</code>.<code>resourcefact</code> table in the XDMoD database</td>
</tr>
<tr>
<td><code>batch_system</code></td><td><code>XDMoD</code></td><td>Sets the module used to obtain job accounting information. This should be set to XDMoD</td>
</tr>
<tr>
<td><code>hostname_mode</code></td><td><code>hostname</code> | <code>fqdn</code></td><td>Determines how compute node names as reported by the resource manager are compared
with the node name information from the PCP archives.
 If the resource manager reports just the hostname for compute nodes in the accounting logs then
this value should be set to <code>hostname</code>. If the resource manager reports
full domain names in the accounting logs then this value should be set to
<code>fqdn</code> (see also the <code>host_name_ext</code> setting below).
Typically, the Slurm resource manager reports just the hostname in the accounting logs.</td>
</tr>
<tr>
<td><code>host_name_ext</code></td><td>[domain name]</td><td>If the <code>hostname_mode</code> is <code>fqdn</code> and the <code>host_name_ext</code> is specified then the string will
be appended to the node name from the PCP archives if it is absent. This is used to workaround misconfigured <code>/etc/hosts</code> files on the compute
nodes that result in only the hostname information begin recorded in the PCP achive metadata.
This setting is ignored if the <code>hostname_mode</code> is set to <code>hostname</code> and may be omitted in this case.</td>
</tr>
<tr>
<td><code>datasource</code></td><td>[pcp or prometheus]</td><td>Data collection software used to monitor the resource.</td>
</tr>
<tr>
<td><code>pcp_log_dir</code></td><td>[filesystem path]</td><td>Path to the PCP log files for the resource.</td>
</tr>
<tr>
<td><code>prom_host</code></td><td>[hostname]</td><td>Hostname for the Prometheus server monitoring the resource.</td>
</tr>
<tr>
<td><code>prom_user</code></td><td>[username]</td><td>Username for basic authentication to the Prometheus server.</td>
</tr>
<tr>
<td><code>prom_password</code></td><td>[password]</td><td>Password for basic authentication to the Prometheus server.</td>
</tr>
<tr>
<td><code>batchscript.path</code></td><td>[filesystem path]</td><td>Path to the batch script files. The batch scripts must be stored following
the naming convention described in the <a href="supremm-jobscript.html">job script documentation</a>. Set this to an empty string if the
batch script files are not saved.</td>
</tr>
<tr>
<td><code>batchscript.timestamp_mode</code></td><td><code>start</code> | <code>submit</code> | <code>end</code> | <code>none</code></td><td>How to interpret the
directory timestamp names for the batch scripts. <code>start</code> means that the directory name corresponds
to the job start time, <code>submit</code> the job submit time, <code>end</code> the job end time and <code>none</code> the timestamp
should not be included in the job lookup.</td>
</tr>
</tbody>
</table>
<br />

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

```json
{
    ...
    "xdmodroot": "/etc/xdmod",
    "datawarehouse": {
        "include": "xdmod://datawarehouse"
    },
}
```

Where xdmodroot should be set to the location of the xdmod configuration
directory, typically `/etc/xdmod` for RPM based installs. Note that the user
account that runs the summarization scripts will need to have read permission
on the xdmod configuration files. For an RPM based install, the `xdmod` user
account has the correct permission.

### Option (2) Direct DB credentials ###

If the summarization software is installed on a dedicated machine (separate
from the Open XDMoD server), then the XDMoD datawarehouse location and access credentials
should be specified as follows:

Create a file called `.supremm.my.cnf` in the home directory of the user that
will run the job summarization software. This file must include the username
and password to the Open XDMoD datawarehouse mysql server:

```ini
[client]
user=[USERNAME]
password=[PASSWORD]
```

ensure the "datawarehouse" section of the `config.json` file has settings like
the following, where *XDMOD\_DATABASE\_FILL\_ME\_IN* should be set to the hostname of
the XDMoD database server.

```json
{
    ...
    "datawarehouse": {
        "db_engine": "MySQLDB",
        "host": "XDMOD_DATABASE_FILL_ME_IN",
        "defaultsfile": "~/.supremm.my.cnf"
    },
}
```

MongoDB settings
----------------

If you used _Option (1) XDMoD path specification_ in the datawarehouse configuration then
use the following configuration settings:

```json
{
    ...
    "outputdatabase": {
        "include": "xdmod://jobsummarydb"
    }
}
```

Otherwise the MongoDB settings can be specified directly as follows:
The `outputdatabase`.`uri` should be set to the uri of the MongoDB server that
will be used to store the job level summary documents.  The uri syntax is
described in the [MongoDB documentation][]. You must specify the database name in
the connection uri string in addition to specifying it in the `dbname` field

```json
{
    ...
    "outputdatabase": {
        "type": "mongodb",
        "uri": "mongodb://localhost:27017/supremm",
        "dbname": "supremm"
    },
}
```

[MongoDB documentation]:        https://docs.mongodb.org/manual/reference/connection-string/


Setup the Database
-------------------

The summarization software uses relational database tables to keep track of
which jobs have been summarized, when and which version of the software was
used. These tables are added to the `modw_supremm` schema that was created when
the Open XDMoD SUPReMM module was installed.  The database creation script is
located in the `/usr/share/supremm/setup` directory and should be run on the
XDMoD datawarehouse DB instance.

    $ mysql -u root -p < [PATH TO PYTHON SITE PACKAGES]/supremm/assets/modw_supremm.sql

Where `[PATH TO PYTHON SITE PACKAGES]` is the path to the python site packages install directory
(`/usr/lib64/python3.6/site-packages` for Rocky 8 RPM install).

Setup MongoDB
-----------

    $ mongo [MONGO CONNECTION URI] [PATH TO PYTHON SITE PACKAGES]/supremm/assets/mongo_setup.js

where [MONGO CONNECTION URI] is the uri of the MongoDB database.
