---
title: Advanced Usage
---

This document describes how to modify the configuration files to show data from
different datasources than the default. This is only necessary if the
default dataset mapping does not provide the required functionality.
Instructions for configuring the default mapping are provided
in the [supremm_resources.json documentation.](supremm-configuration.html#supremm_resourcesjson)

If a custom dataset mapping file is used then it must be maintained and
may need to be modified when the XDMoD software is upgraded.

This document only describes instructions for PCP and Prometheus-based datasources. However,
the same techniques describe here can be used to generate data mappings for
other datasources such as [HPCPerfStats](https://github.com/TACC/HPCPerfStats) that is used in the [ACCESS version of XDMoD](https://xdmod.access-ci.org).

## Background

The overall architecture is described in [Architecture](supremm-architecture.md) section. This section
goes into more detail about the ingestion data flow.

A schematic of the data flow is shown in Figure [1](#mongo-to-xdmod-dfd) below.
The job summarization software writes job information to a MongoDB instance.
There are two documents per job: a document containing the summary statistics for
a job such as the CPU usage and accounting information and a document that contains
the timeseries data for a subset of job metrics. The timeseries document is used
as the data source for the timeseries plots in the XDMoD job viewer.
The summary statistics document
is read at ingest time by the `etl.cluster.js` script (which is executed in the `aggregate_supremm.sh` script) to load data into
the XDMoD MySQL-based datawarehouse.  The `etl.cluster.js` loads
a dataset mapping module that defines how
data are copied from the summary statistics document to the datawarehouse. The default dataset mapping module file is
`supremm.js`. The previous default mapping `pcp.js` has been deprecated, however resources already configured with the 'pcp'
dataset mapping will still function normally.

XDMoD supports using a different dataset mapping file for each
HPC resource. The dataset mapping file to use for a given resource is configured
in the `datasetmap` parameter in the [supremm_resources.json](supremm-configuration.html#supremm_resourcesjson)
file.  The dataset mapping is a written in javascript and supports
arbitrary javascript functions to transform the job data.

<img src="{{ site.baseurl }}/assets/images/mongo_to_xdmod_DFD.svg" id="mongo-to-xdmod-dfd" width="850" alt="Dataflow diagram of ingest of job data from MongoDB to the XDMoD datawarehouse"/>

_Figure 1. Flow of information from job summary documents in MongoDB to the XDMoD datawarehouse._

## Example

The following example shows how to modify the dataset mapping file to support
reading job data from the job summary document that is different from the
default.

In this example we describe how to extend the dataset mapping to map data
from the lustre llite statistics to the Filesystem I/O statistics in XDMoD.
The default mapping file reads nfs filesystem metrics based on the configuration
settings in the [supremm_resources.json](supremm-configuration.html#supremm_resourcesjson) file. This example
shows how to override this so the metrics are instead gathered from the lustre metrics.

The steps to configure the software are as follows:
1. Create a new dataset map.
1. Configure XDMoD to use the new dataset map.
1. Test the new dataset map.
1. Re-ingest the job data into XDMoD.


### 1. Create a new dataset mapping

A new dataset mapping file should be created in `/usr/share/xdmod/etl/js/config/supremm/dataset_maps`. In this
example, the new mapping file will be called `custom.js`. The file name should follow the Node.js
module naming convention. The source of the new mapping file is shown below:
```js
// load the default mapping module
var supremm = require('./supremm.js');

// load the library that contains helper functions
var map_helpers = require('../map_helpers.js');

module.exports = function (config) {

    // create a new copy of the default map
    var supremm_map = new supremm(config);

    // override the mapping attributes for netdir home and util:

    //           The second argument should be set to the name of the
    //           filesystem as it appears in the job level summary    ----┐
    //                                                                    ▾
    supremm_map.attributes.netdir_home_read = map_helpers.device('lustre', '/home', 'read_bytes-total');
    supremm_map.attributes.netdir_home_write = map_helpers.device('lustre', '/home', 'write_bytes-total');

    supremm_map.attributes.netdir_util_read = map_helpers.device('lustre', '/util', 'read_bytes-total');
    supremm_map.attributes.netdir_util_write = map_helpers.device('lustre', '/util', 'write_bytes-total');

    // can add more overrides here....

    return supremm_map;
}
```
This loads the default mapping and selectively overrides fields.

### 2. Configure XDMoD to use the new map.

The [supremm_resources.json](supremm-configuration.html#supremm_resourcesjson) file defines
the dataset map to use for each resource. For the purpose of this example, we assume that
the resource name is `wopr`. The configuration setting would then look similar to:
```json
{
    "resources": [
        {
            "resource": "wopr",
            "resource_id": 1,
            "enabled": true,
            "datasetmap": "custom",
            "hardware": {
                "gpfs": "gpfs0",
                "network": [
                    "em1",
                    "eno1"
                ]
            }
    ...
```

### 3. Testing the new mapping

XDMoD does not require tests exist for a dataset mapping, however it is
highly recommended to create at least one test case since it significantly
helps with debugging problems in the mapping. If you do not wish to create test
cases then this step can be skipped.

The XDMoD software has a test mode that can be used to verify the dataset
mapping. The test mode requires one or more input files each of which must
contain a job summary document in json format. Each input file must have a corresponding
output json file that contains the expected results. The test harness has
a mechanism to generate the output file. The generated output file must
be manually verified for the test to be meaningful.

Steps to run the tests:

1) Generate a json input file by exporting a job record from the MongoDB database in json format.
The [mongoexport](https://docs.mongodb.com/manual/reference/program/mongoexport/) command can
be used to export documents in json format. Note that newer versions of mongoexport output
the data in an 'extended' json format. The test input files should be in the mongodb
relaxed json format (see the [MongoDB json documentation](https://docs.mongodb.com/manual/reference/mongodb-extended-json/) for
full details. Briefly, if the output file contains data similar to:
```js
    "acct": {
        "local_job_id" : NumberLong(4014453)
    }
```
or
```json
    "acct": {
        "local_job_id" : {
            "$numberLong": "4014453"
        }
    }
```
these should be edited to use a plain json number field
```json
    "acct": {
        "local_job_id" : 4014453
    }
```

2) Copy the input file to the `/usr/share/xdmod/etl/js/config/supremm/tests/[RESOURCE]/input`
directory where `[RESOURCE]` is the name of the resource with the new
mapping file as it appears in `supremm_resources.json`. The name of the file should
match the document identifier from MongoDB (i.e. the `_id` field).

 For example, if the input file was for job id 8291026 (mongo `_id` = 8291026-1518721536)
on the `wopr` resource then the file would be called `/usr/share/xdmod/etl/js/config/supremm/tests/wopr/input/8291026-1518721536.json`

3) Create the expected output file. The easiest way to create the output file is to create an empty json
document in the output directory: `/usr/share/xdmod/etl/js/config/supremm/tests/[RESOURCE]/expected`.
For example the output file corresponding to the example input file above would be
`/usr/share/xdmod/etl/js/config/supremm/tests/wopr/expected/8291026-1518721536.json`
with contents:

```json
{}
```
Then edit the file `/usr/share/xdmod/etl/js/lib/etl_profile.js` and change the
line:
```js
    var regenerateOnFail = false;
```
to
```js
    var regenerateOnFail = true;
```
Then run the following:
```bash
$ cd /usr/share/xdmod/etl/js
$ node etl.cli.js -t -d
```
This will generate a large number of error log messages since the expected
results file is empty. But since the `regenerateOnFail` variable is set to true it
will overwrite the expected result file with the new data. Manually
check the file to confirm that the data are correct. In this example, there
should be values in the file for the various `netdir` metrics added in the
new custom mapping:
```json
{
    "netdir_home_read": {
        "value": 1235,
        "error": 0
    },
    "netdir_home_write": {
        "value": 1235,
        "error": 0
    },
    "netdir_util_read": {
        "value": 136192137,
        "error": 0
    },
    "netdir_util_write": {
        "value": 0,
        "error": 0
    }
}
```
The `/usr/share/xdmod/etl/js/lib/etl_profile.js` should be edited again to revert the
change to the `regenerateOnFail` variable.

4) Finally re-run the test harness again and confirm that the tests pass:
```bash
$ cd /usr/share/xdmod/etl/js
$ node etl.cli.js -t -d
```
```bash
2020-03-10T18:12:42.401Z - info: Regression Testing...
2020-03-10T18:12:42.513Z - info: Regression test of "8291026-1518721536.json" passed
```

### 4. Re-ingest data into XDMoD

Reset the job ingest status for all jobs:

```bash
$ /usr/lib64/xdmod/xdmod-supremm-admin --action reset --resource [RESOURCE] -d
```

Run the ingest and aggregation script:
```bash
$ aggregate_supremm.sh
```
