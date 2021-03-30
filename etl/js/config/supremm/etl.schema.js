/*node.js javascript document
 *
 * @authors: Amin Ghadersohi
 * @date: 2/6/2014
 *
 * The unified schema document for supremm data. Helps map
 * a dataset from multiple sources where the sources are not the same
 * nor are the records expected to abide by a schema.
 *
 * @requirements:
 *	node.js
 *
 */


function getIf(condition, _then, _else) {
    return "CASE WHEN " + condition +
        " then " + _then +
        " else " + _else +
         " end";
}

function getDistributionSQLCaseStatement(stat, _max, s1, e1, s2, e2) {
    return "case when (" + s1 + " between " + s2 + " and " + e2 + " and "
        + e1 + " between " + s2 + " and " + e2 + " ) "
        + " then " + stat + " "
        + " when (" + s1 + " < " + s2 + " and "
        + e1 + " between " + s2 + " and " + e2 + " ) "
        + " then " + stat + " * (" + e1 + " - " + s2 + " + 1 ) / ( " + e1 + " - " + s1 + " + 1) "
        + " when (" + s1 + " between " + s2 + " and " + e2 + " and "
        + e1 + " > " + e2 + " ) "
        + " then " + stat + " * (" + e2 + " - " + s1 + " + 1 ) / (" + e1 + " - " + s1 + " + 1) "
        + " when (" + s1 + " < " + s2 + " and "
        + e1 + " > " + e2 + " ) "
        + " then    " + stat + " *( " + _max + " ) / (" + e1 + " - " + s1 + " + 1) "
        + " else " + stat + " "
        + " end";
}

var wallduration_case_statement = getDistributionSQLCaseStatement('wall_time', ':seconds', 'start_time_ts', 'end_time_ts', ":period_start_ts", ":period_end_ts");

function getSumMetric(stat)
{
    return "sum(" + getDistributionSQLCaseStatement( '(' + stat + ')', ':seconds', 'start_time_ts', 'end_time_ts', ":period_start_ts", ":period_end_ts") + ")";
}

function getWeightMetric(stat, per)
{
    return "sum( case when (" + stat + " IS NOT NULL) then 1.0 else 0.0 end * " + per + " * " + wallduration_case_statement + ')';
}

module.exports = {
    version: 201403041734,
    tables: {
        //list of tables to be created/modified by the etl process. fields and derived
        //fields indicate belonging to a table via the table tag (ie: table: "job")
        //other tables are not managed by etl. For example, the name field below
        //is inserted into modw_supremm.job_name which needs to pre exist in the
        //output of the etl profile
        job: {
            schema: "modw_supremm",
            definition: "dynamic",
            unique: ["resource_id", "local_job_id", "end_time_ts"],
            extras: [
                "KEY localjobid (resource_id,local_job_id)",
                  "KEY aggregation_index (end_time_ts,start_time_ts)"
            ]
        }
    },
    dimension_tables: {
        application: {
            schema: "modw_supremm",
            // table definition of static means that the table is defined elsewere
            // and assumed to exist already.
            definition: "static",
            import_stmt: function() {
                var appload = require('./applicationtables.js');
                return appload(__dirname + '/application.json').getsql();
            }
        }
    },
    postprocess: [
        'UPDATE ' +
        '   modw_supremm.job j, ' +
        '   modw.job_tasks jt, ' +
        '   modw.job_records jr ' +
        'SET ' +
        '   j.account_id = jr.account_id, ' +
        '   j.fos_id = jr.fos_id, ' +
        '   j.person_id = jt.person_id, ' +
        '   j.person_organization_id = jt.person_organization_id, ' +
        '   j.principalinvestigator_person_id = jr.principalinvestigator_person_id, ' +
        '   j.piperson_organization_id = jr.piperson_organization_id, ' +
        '   j.systemaccount_id = jt.systemaccount_id, ' +
        '   j.tg_job_id = jt.job_id ' +
        'WHERE ' +
        '   j.resource_id = jt.resource_id ' +
        '   AND j.local_job_id = jt.local_job_id_raw ' +
        '   AND j.end_time_ts = jt.end_time_ts ' +
        '   AND j.tg_job_id != jt.job_id ' +
        '   AND jr.job_record_id = jt.job_record_id ' +
        '   AND j.tg_job_id = -1'],

    aggregationTables: {
        supremmfact: {
            schema: 'modw_aggregates',
            definition: 'dynamic',
            realmName: 'SUPREMM',
            statTemplate: {
                weightStat: 'running_job_count'
            },
            fields: {
                running_job_count: {
                    type: 'int32',
                    dimension: false,
                    sql: 'sum(1)',
                    comments: 'The number of jobs that were running during this period.',
                    stats: [{
                        sql: 'coalesce(sum(jf.running_job_count),0)',
                        label: 'Number of Jobs Running',
                        unit: 'Number of Jobs',
                        description: 'The total number of running jobs.<br/>'
                                   + '<i>Job: </i>A scheduled process for a computer resource in a batch processing environment',
                        decimals: 0
                    }]
                },
                sum_weighted_expansion_factor: {
                    type: 'double',
                    dimension: false,
                    sql: 'sum( ((wall_time + wait_time) / wall_time) * nodecount_id * ' + wallduration_case_statement + ')',
                    comments: 'The sum of expansion factor per job multiplied by nodecount and the [adjusted] duration of jobs that ran in this period.'
                }
            }
        }
    },
    etlLogging: {
        init: function() {
            this.min_ts = null;
            this.max_ts = null;
            this.start_ts = Date.now();
            this.end_ts = null;
        },
        onEndDoc: function(values) {
            this.end_ts = Date.now();
            if (values.start_time_ts !== undefined && values.start_time_ts !== null) {
                if (this.min_ts === null) {
                    this.min_ts = values.start_time_ts;
                } else {
                    this.min_ts = Math.min(this.min_ts, values.start_time_ts);
                }
                if (this.max_ts === null) {
                    this.max_ts = values.start_time_ts;
                } else {
                    this.max_ts = Math.max(this.max_ts, values.start_time_ts);
                }
            }
        },
        onEndProcess: function(processingDetails) {
            this.end_ts = Date.now();
            //the format of the etlLog object is as follows:
            var etlLog = {
                etlProfileName: processingDetails.etlProfileName,
                etlProfileVersion: processingDetails.etlProfileVersion,
                dataset: processingDetails.dataset,
                start_ts: this.start_ts / 1000,
                end_ts: this.end_ts / 1000,
                min_index: this.min_ts,
                max_index: this.max_ts,
                processed: processingDetails.processed,
                good: processingDetails.good,
                details: JSON.stringify(processingDetails)
            };

            return etlLog;//the data processor inserts this.
        }
    },
    fields: {
        local_job_id: {
            unit: null,
            type: "int32",
            dtype: "accounting",
            group: "Administration",
            nullable: false,
            def: null,
            batchExport: true,
            comments: "The unique identifier assigned to the job by the job scheduler.",
            per: "job",
            table: "job"
        },
        name: {
            unit: null,
            type: "string",
            dtype: "accounting",
            group: "Executable",
            nullable: false,
            def: "NA",
            comments: "The name of the job as reported by the job scheduler.",
            per: "job",
            table: "job",
            dim_insert: function(attributes) {
                return {
                    query: "INSERT IGNORE INTO modw_supremm.job_name (name, name_md5) VALUES (:name, MD5(:name))",
                    values: {name: attributes.name.value}
                };
            }
        },
        datasource: {
            unit: null,
            type: "string",
            dtype: "accounting",
            group: "Other",
            nullable: false,
            def: "NA",
            comments: "The software used to collect the performance data.",
            per: "job",
            dim_insert: function(attributes) {
                return {
                    query: "INSERT IGNORE INTO modw_supremm.datasource (description) VALUES (:description)",
                    values: {description: attributes.datasource.value}
                };
            }
        },
        resource_name: {
            unit: null,
            type: "string",
            dtype: "accounting",
            group: "Allocated resource",
            nullable: false,
            def: null,
            comments: "the short name of the hosting resource",
            per: "job"
        },
        resource_id: {
            unit: null,
            type: "int32",
            dtype: "foreignkey",
            group: "Administration",
            nullable: false,
            def: null,
            batchExport: true,
            comments: "The resource that ran the job.",
            per: "job",
            table: "job",
            agg: {
                table: 'supremmfact',
                roles: { disable: [ "pub" ] },
                dimension: true
            },
            join: {
                schema: 'modw',
                table: 'resourcefact'
            }
        },
        organization_id: {
            unit: null,
            type: "int32",
            dtype: "foreignkey",
            group: "Administration",
            nullable: false,
            def: null,
            batchExport: true,
            comments: "The organization that owns the resource on which the job ran.",
            per: "job",
            table: "job",
            agg: {
                table: 'supremmfact',
                alias: 'provider',
                roles: { disable: [ "pub" ] },
                dimension: true
            },
            join: {
                schema: 'modw',
                table: 'organization'
            }
        },
        account: {
            unit: null,
            type: "string",
            dtype: "accounting",
            group: "Administration",
            length: 50,
            nullable: false,
            def: "NA",
            comments: "The name of the account or project (also known as a charge number).",
            per: "job",
            table: "job"
        },
        username: {
            unit: null,
            type: "string",
            name: "System Username",
            dtype: 'ignore',
            group: "Administration",
            visibility: 'non-public',
            length: 50,
            nullable: true,
            def: null,
            batchExport: 'anonymize',
            comments: "The username on the resource of the user that ran the job. May be a UID or string username depending on the resource.",
            per: "job",
            table: "job"
        },
        cwd: {
            unit: null,
            type: "string",
            dtype: "accounting",
            group: "Executable",
            nullable: false,
            def: "NA",
            comments: "The current working directory where the executable was launched",
            per: "job",
            dim_insert: function(attributes) {
                return {
                    query: "INSERT IGNORE INTO modw_supremm.cwd (resource_id, cwd, cwd_md5) VALUES (:resource_id, :cwd, MD5(:cwd))",
                    values: {resource_id: attributes.resource_id.value, cwd: attributes.cwd.value}
                };
            }
        },
        executable: {
            unit: null,
            type: "string",
            dtype: "accounting",
            group: "Executable",
            nullable: false,
            def: "NA",
            comments: "The full path and name of the main binary file.",
            per: "job",
            dim_insert: function(attributes) {
                return {
                    query: "INSERT IGNORE INTO modw_supremm.executable (`resource_id`, `exec`, `binary`, `exec_md5`, `application_id`) " +
                           "VALUES (:resource_id, :exec, substring_index(:exec,'/',-1), MD5(:exec), COALESCE((SELECT id FROM modw_supremm.application WHERE `name` = :appname), -1) )",
                    values: {resource_id: attributes.resource_id.value, exec: attributes.executable.value, appname: attributes.application.value}
                };
            }
        },
        application: {
            unit: null,
            type: "string",
            dtype: "accounting",
            group: "Executable",
            nullable: false,
            def: "NA",
            comments: "The name of the application that ran",
            per: "job",
        },
        exit_status: {
            unit: null,
            type: "string",
            dtype: "accounting",
            group: "Executable",
            nullable: false,
            def: "NA",
            batchExport: true,
            comments: "The overall job exit status reported by the job scheduler.",
            per: "job",
            dim_insert: function (attributes) {
                return {
                    query: "insert ignore into modw_supremm.exit_status (name) values (:name)",
                    values: {name: attributes.exit_status.value}
                };
            }
        },
        granted_pe: {
            unit: null,
            type: "int32",
            dtype: "ignore",
            nullable: false,
            def: null,
            comments: "number of granted processing elements (i.e. wayness)",
            per: "job",
            table: "job",
            dim_insert: function (attributes) {
                return {
                    query: "insert ignore into modw_supremm.granted_pe (id, name) values (:id, :name)",
                    values: {id: attributes.granted_pe.value, name: attributes.granted_pe.value}
                };
            },
            agg: {
                table: 'supremmfact',
                roles: { disable: [ "pub" ] },
                dimension: true
            }
        },
        queue: {
            unit: null,
            type: "string",
            dtype: "ignore",
            length: 50,
            nullable: false,
            def: "NA",
            comments: "The name of the queue to which the job was submitted.",
            per: "job",
            //table: "job",
            dim_insert: function(attributes) {
                return {
                    query: "insert ignore into modw.queue (id, resource_id) values (:id, :resource_id)",
                    values: {id: attributes.queue.value, resource_id: attributes.resource_id.value}
                };
            }
        },
        requested_nodes: {
            unit: null,
            type: "int32",
            dtype: "accounting",
            group: "Requested resource",
            nullable: false,
            def: 0,
            batchExport: true,
            comments: "The number of nodes requested at job submission time. This value will be zero if the user did not specify the number of required nodes or if this information is not provided for the resource.",
            per: "job",
            table: "job"
        },
        hosts: {
            name: "Host List",
            unit: null,
            type: "array",
            dtype: "accounting",
            group: "Allocated resource",
            nullable: true,
            def: [],
            comments: "array of host names (i.e. [n1r1.x.y.edu, n2r1,x.y.edu, ...])",
            per: "job",
            dim_insert: function(attributes) {
                var ret = [];
                for (var i = 0; i < attributes.hosts.value.length; i++) {
                    ret.push({
                        query: "insert ignore into modw_supremm.host (resource_id, name) values (:resource_id, :name)",
                        values: {resource_id: attributes.resource_id.value, name: attributes.hosts.value[i]}
                    });
                    ret.push({
                        query: 'insert ignore into modw_supremm.jobhost (local_job_id, resource_id, end_time_ts, host_id) '
                             + 'values (:local_job_id, :resource_id, :end_time_ts, (select id from modw_supremm.host where resource_id = :resource_id and name = :name ))',
                        values: {
                            local_job_id: attributes.local_job_id.value,
                            resource_id: attributes.resource_id.value,
                            end_time_ts: attributes.end_time_ts.value,
                            name: attributes.hosts.value[i]
                        },
                        cacheable: false
                    });
                }
                return ret;
            }
        },
        nodes: {
            unit: null,
            type: "int32",
            dtype: "accounting",
            group: "Allocated resource",
            nullable: false,
            def: 0,
            batchExport: true,
            comments: "The number of nodes that were assigned to the job.",
            per: "job",
            table: "job",
            dim_insert: function (attributes) {
                return {
                    query: "insert ignore into modw.nodecount (id, nodes) values (:id, :nodes)",
                    values: {id: attributes.nodes.value, nodes: attributes.nodes.value }
                };
            }
        },
        shared: {
            unit: "boolean",
            type: "tinyint",
            dtype: "accounting",
            group: "Allocated resource",
            nullable: false,
            def: 0,
            batchExport: true,
            comments: "Whether the job ran on a node that ran at least one other job.",
            per: "job",
            table: "job",
            agg: [ {
                    table: 'supremmfact',
                    type: 'tinyint',
                    roles: { disable: [ "pub" ] },
                    dimension: true,
                    comments: "Whether the job ran on a node that ran at least one other job."
            } ]
        },
        cores: {
            unit: null,
            type: "int32",
            dtype: "accounting",
            group: "Allocated resource",
            nullable: false,
            def: 0,
            batchExport: true,
            comments: "The total number of cores assigned to the job.",
            per: "job",
            table: "job",
            agg: [
                {
                    table: 'supremmfact',
                    type: 'int32',
                    alias: 'jobsize',
                    roles: { disable: [ "pub" ] },
                    dimension: true,
                    comments: "Number of processor cores each of the jobs used."
                },
                {
                    name: 'processorbucket_id',
                    type: 'int32',
                    dimension: false, //don't need to group by this since we are grouping by cores.
                    table: 'supremmfact',
                    sql: '(select id from processor_buckets pb where cores between pb.min_processors and pb.max_processors)',
                    comments: 'Processor bucket or job size buckets are prechosen in the modw.processor_buckets table.'
                }
            ]
        },
        cores_avail: {
            name: "Total Cores Available",
            unit: null,
            type: "int32",
            dtype: "accounting",
            group: "Allocated resource",
            nullable: false,
            def: 0,
            batchExport: true,
            comments: "Total number of cores present on the nodes on which the job ran.",
            per: "job",
            table: "job"
        },
        submit_time_ts: {
            name: "Submit Time",
            unit: "ts",
            type: "int32",
            dtype: "accounting",
            group: "Timing",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "The time that the job was submitted to the job scheduler.",
            per: "job",
            table: "job",
            agg: [{
                name: 'submitted_job_count',
                table: 'supremmfact',
                type: 'int32',
                dimension: false,
                sql: 'sum(' + getIf('submit_time_ts between :period_start_ts and :period_end_ts', 1, 0) + ')',
                comments: 'The number of jobs that started during this period.',
                stats: [{
                    sql: 'coalesce(sum(jf.submitted_job_count),0)',
                    label: 'Number of Jobs Submitted',
                    unit: 'Number of Jobs',
                    description: 'The total number of jobs that were submitted/queued within the selected duration.<br/>'
                               + '<i>Job: </i>A scheduled process for a computer resource in a batch processing environment.',
                    decimals: 0
                }]
            }]
        },
        eligible_time_ts: {
            name: "Eligible Time",
            unit: "ts",
            type: "int32",
            dtype: "accounting",
            group: "Timing",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "The time that the job was ready to be run by the scheduler.",
            per: "job",
            table: "job"
        },
        start_time_ts: {
            name: "Start Time",
            unit: "ts",
            type: "int32",
            dtype: "accounting",
            group: "Timing",
            nullable: false,
            def: null,
            batchExport: true,
            comments: "The time that the job started running.",
            per: "job",
            table: "job",
            agg: [{
                name: 'started_job_count',
                table: 'supremmfact',
                type: 'int32',
                dimension: false,
                sql: 'sum(' + getIf('start_time_ts between :period_start_ts and :period_end_ts', 1, 0) + ')',
                comments: 'The number of jobs that started during this period.',
                stats: [{
                    sql: 'coalesce(sum(jf.started_job_count),0)',
                    label: 'Number of Jobs Started',
                    unit: 'Number of Jobs',
                    description: 'The total number of jobs that started executing within the selected duration.<br/>'
                               + '<i>Job: </i>A scheduled process for a computer resource in a batch processing environment.',
                    decimals: 0
                }]
            }]
        },
        end_time_ts: {
            name: "End Time",
            unit: "ts",
            type: "int32",
            dtype: "accounting",
            group: "Timing",
            nullable: false,
            def: null,
            batchExport: true,
            comments: "The time that the job ended.",
            per: "job",
            table: "job",
            agg: [{
                name: 'job_count',
                type: 'int32',
                table: 'supremmfact',
                dimension: false,
                sql: 'sum(' + getIf('end_time_ts between :period_start_ts and :period_end_ts', 1, 0) + ')',
                comments: 'The number of jobs that ended during this period.',
                stats: [{
                    sql: 'coalesce(sum(jf.job_count),0)',
                    label: 'Number of Jobs Ended',
                    unit: 'Number of Jobs',
                    description: 'The total number of jobs that ended within the selected duration.<br/>'
                                + '<i>Job: </i>A scheduled process for a computer resource in a batch processing environment.',
                    decimals: 0
                }]
            }]
        },
        wall_time: {
            name: "Wall Time",
            unit: "seconds",
            type: "int32",
                dtype: "accounting",
            group: "Timing",
            nullable: false,
            def: 0,
            batchExport: true,
            comments: "The wall-clock duration of the job.",
            per: "job",
            table: "job",
            agg: [{
                name: 'jobtime_id',
                table: 'supremmfact',
                alias: 'jobwalltime',
                type: 'int32',
                roles: { disable: [ "pub" ] },
                dimension: true,
                sql: '(select id from job_times jt where wall_time >= jt.min_duration and wall_time <= jt.max_duration)',
                comments: 'Job time is bucketing of wall time based on prechosen intervals in the modw.job_times table.'
            }, {
                name: 'wall_time',
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: 'coalesce(sum(' + wallduration_case_statement + '),0)',
                comments: 'The wall_time of the jobs that were running during this period. This will only count the walltime of the jobs that fell during the period.',
                stats: [{
                    sql: 'coalesce(sum(jf.wall_time*jf.cores/3600.0),0)',
                    label: 'CPU Hours: Total',
                    unit: 'CPU Hour',
                    description: 'The total core time, in hours.<br/>'
                            +	 '<i>Core Time:</i> defined as the time between start and end time of execution for a particular job times the number of allocated cores.',
                    decimals: 0
                }, {
                    name: 'wall_time_per_job',
                    aggregate_sql: 'COALESCE(SUM(jf.wall_time)/SUM(CASE ${DATE_TABLE_ID_FIELD} WHEN ${MIN_DATE_ID} THEN jf.running_job_count ELSE jf.started_job_count END),0)/3600.0',
                    timeseries_sql: 'COALESCE(SUM(jf.wall_time)/SUM(jf.running_job_count),0)/3600.0',
                    label: 'Wall Hours: Per Job',
                    unit: 'Hour',
                    description: 'The average time, in hours, a job takes to execute.<br/>'
                            +	 '<i>Wall Time:</i> Wall time is defined as the linear time between start and end time of execution for a particular job.',
                    decimals: 2
                }]
            }]
        },
        requested_wall_time: {
            name: "Requested Wall Time",
            unit: "seconds",
            type: "int32",
            dtype: "accounting",
            group: "Requested resource",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "The requested job duration.",
            per: "job",
            table: "job",
            agg: [{
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: 'coalesce(sum(' + getDistributionSQLCaseStatement('requested_wall_time', ':seconds', 'start_time_ts', 'end_time_ts', ":period_start_ts", ":period_end_ts") + '),0)',
                comments: 'The requested wall time of the jobs that were running during this period. This will only count the walltime of the jobs that fell during the period.',
                stats: [{
                    sql: 'coalesce(sum(jf.requested_wall_time/3600.0),0)',
                    label: 'Wall Hours: Requested: Total',
                    unit: 'Hour',
                    description: 'The total time, in hours, jobs requested for execution.<br/>'
                            +	 '<i>Requested Wall Time:</i> Requsted wall time is defined as the user requested linear time between start and end time for execution of a particular job.',
                    decimals: 0
                }, {
                    name: 'requested_wall_time_per_job',
                    aggregate_sql: 'COALESCE(SUM(jf.requested_wall_time)/SUM(CASE ${DATE_TABLE_ID_FIELD} WHEN ${MIN_DATE_ID} THEN jf.running_job_count ELSE jf.started_job_count END),0)/3600.0',
                    timeseries_sql: 'COALESCE(SUM(jf.requested_wall_time)/SUM(jf.running_job_count),0)/3600.0',
                    label: 'Wall Hours: Requested: Per Job',
                    unit: 'Hour',
                    description: 'The average time, in hours, a job requested for execution.<br/>'
                            +	 '<i>Requested Wall Time:</i> Requsted wall time is defined as the user requested linear time between start and end time for execution of a particular job.',
                    decimals: 2
                }]
            }]
        },
        wait_time: {
            unit: "seconds",
            type: "int32",
            dtype: "accounting",
            group: "Timing",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "The amount of time between job submit and job start.",
            per: "job",
            table: "job",
            agg: [{
                name: 'wait_time',
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: 'coalesce(sum(' + getIf('start_time_ts between :period_start_ts and :period_end_ts', 'wait_time', 0) + '),0)',
                comments: 'The amount of time jobs waited to execute during this period.',
                stats: [{
                    sql: 'coalesce(sum(jf.wait_time/3600.0),0)',
                    weightStat: 'started_job_count',
                    label: 'Wait Hours: Total',
                    unit: 'Hour',
                    description: 'The total time, in hours, jobs waited before execution on their designated resource.<br/>'
                                + '<i>Wait Time: </i>Wait time is defined as the linear time between submission of a job by a user until it begins to execute.'
                }, {
                    name: 'wait_time_per_job',
                    sql: 'coalesce(sum(jf.wait_time/3600.0)/sum(jf.started_job_count),0)',
                    label: 'Wait Hours: Per Job',
                    unit: 'Hour',
                    description: 'The average time, in hours, a job waits before execution on the designated resource.<br/>'
                                + '<i>Wait Time: </i>Wait time is defined as the linear time between submission of a job by a user until it begins to execute.',
                    decimals: 2
                }]
            }
            ]
        },
        cpu_time: {
            unit: "seconds",
            type: "int32",
            dtype: "accounting",
            group: "Allocated resource",
            nullable: false,
            def: 0,
            batchExport: true,
            comments: "The total CPU core time. This value is calculated as number of assigned cores multiplied by duration if not provided by the scheduler.",
            per: "job",
            table: "job",
            agg: [ {
                name: 'cpu_time',
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: getSumMetric('cpu_time'),
                comments: 'The amount of the cpu_time of the jobs pertaining to this period. If a job took more than one period, its cpu_time is distributed linearly across the periods it spans.'

            }
            ]
        },
        node_time: {
            unit: "seconds",
            type: "int32",
            dtype: "accounting",
            group: "Allocated resource",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "Total node time. This value is calculated as number of assigned nodes multiplied by duration if not provided by the scheduler.",
            per: "job",
            table: "job",
            agg: [ {
                name: 'node_time',
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: 'coalesce(sum(' + getDistributionSQLCaseStatement('node_time', ':seconds', 'start_time_ts', 'end_time_ts', ":period_start_ts", ":period_end_ts") + '), 0)',
                comments: 'The amount of the node_time of the jobs pertaining to this period. If a job took more than one period, its node_time is distributed linearly across the periods it spans.'

            }
            ]
        },
        cpu_idle: {
            unit: "cpuratio",
            type: "double",
            name: "CPU Idle",
            group: "CPU Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "The ratio of idle cpu time to total cpu time for the cores that the job was assigned.",
            per: "core",
            raw_per: "core",
            algorithm: "$ frac{  sum limits_{i=1}^N x_i } { N }$ where $x_i$ are the cpu idle fractions for each one of the $N$ cores the job ran on",
            algorithm_description: "mean value of the cpu idle fractions",
            typical_usage: "Measuring job efficiency: How much of the allocated resource did the job use? Jobs with high cpu_idle are not using all cpu resources they requested",
            table: "job",
            agg: [ {
                name: 'cpu_time_idle',
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: getSumMetric('cpu_time*cpu_idle'),
                comments: 'The amount of the idle cpu_time of the jobs pertaining to this period.',
                stats: [ {
                    sql: 'sum(jf.cpu_time_idle/3600.0)',
                    label: 'CPU Hours: Idle: Total',
                    unit: 'CPU Hour',
                    requirenotnull: 'jf.cpu_time_idle',
                    description: 'The idle CPU hours for all jobs that were executing during the time period.'
                }, {
                    name: 'avg_percent_cpu_idle',
                    sql: 'sum(100.0 * jf.cpu_time_idle / jf.cpu_time * jf.cpu_usage_weight)/sum(jf.cpu_usage_weight)',
                    label: 'Avg CPU %: Idle: weighted by core-hour',
                    requirenotnull: 'jf.cpu_time_idle',
                    unit: 'CPU %',
                    description: 'The average CPU idle % weighted by core hours, over all jobs that were executing.'
                }]

            }
            ]
        },
        cpu_system: {
            unit: "cpuratio",
            type: "double",
            name: "CPU System",
            nullable: true,
            group: "CPU Statistics",
            def: null,
            batchExport: true,
            comments: "The ratio of system cpu time to total cpu time for the cores that the job was assigned.",
            per: "core",
            raw_per: "core",
            algorithm: "$ frac{  sum limits_{i=1}^N x_i } { N }$ where $x_i$ are the cpu system fractions for each one of the $N$ cores the job ran on",
            algorithm_description: "mean value of the cpu system fractions",
            typical_usage: "Measuring job resource efficiency. Jobs with high cpu_system will typically have heavy system call usage or be using the system in a way that causes high system usage (e.g. thrashing memory).",
            table: "job",
            agg: [ {
                name: 'cpu_time_system',
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: getSumMetric('cpu_time*cpu_system'),
                comments: 'The amount of the system cpu_time of the jobs pertaining to this period.',
                stats: [ {
                    sql: 'sum(jf.cpu_time_system/3600.0)',
                    label: 'CPU Hours: System: Total',
                    requirenotnull: 'jf.cpu_time_system',
                    unit: 'CPU Hour',
                    description: 'The system CPU hours for all jobs that were executing during the time period.'
                }, {
                    name: 'avg_percent_cpu_system',
                    sql: 'sum(100.0 * jf.cpu_time_system / jf.cpu_time * jf.cpu_usage_weight)/sum(jf.cpu_usage_weight)',
                    label: 'Avg CPU %: System: weighted by core-hour',
                    requirenotnull: 'jf.cpu_time_system',
                    unit: 'CPU %',
                    description: 'The average CPU system % weighted by core hours, over all jobs that were executing.'
                }]

            }
            ]
        },
        cpu_user: {
            unit: "cpuratio",
            type: "double",
            name: "CPU User",
            nullable: true,
            group: "CPU Statistics",
            def: null,
            batchExport: true,
            comments: "The ratio of user cpu time to total cpu time for the cores that the job was assigned.",
            per: "core",
            raw_per: "core",
            algorithm: "$ frac{  sum limits_{i=1}^N x_i } { N }$ where $x_i$ are the cpu user fractions for each one of the $N$ cores the job ran on",
            algorithm_description: "mean value of the cpu user fractions",
            typical_usage: "Measuring job efficiency: How much of the allocated resource did the job use? Jobs with low cpu_user are not using all cpu resources they requested",
            table: "job",
            agg: [ {
                name: 'cpu_time_user',
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: getSumMetric('cpu_time*cpu_user'),
                comments: 'The amount of the user cpu_time of the jobs pertaining to this period.',
                stats: [ {
                    sql: 'sum(jf.cpu_time_user/3600.0)',
                    label: 'CPU Hours: User: Total',
                    requirenotnull: 'jf.cpu_time_user',
                    unit: 'CPU Hour',
                    description: 'The user CPU hours for all jobs that were executing during the time period.'
                }, {
                    name: 'avg_percent_cpu_user',
                    sql: 'sum(100.0 * jf.cpu_time_user / jf.cpu_time * jf.cpu_usage_weight)/sum(jf.cpu_usage_weight)',
                    label: 'Avg CPU %: User: weighted by core-hour',
                    requirenotnull: 'jf.cpu_time_user',
                    unit: 'CPU %',
                    description: 'The average CPU user % weighted by core hours, over all jobs that were executing.'
                }]
            }, {
                name: 'cpu_user_bucketid',
                type: 'int32',
                alias: 'cpuuser',
                roles: { disable: [ "pub" ] },
                dimension: true,
                category: 'Metrics',
                table: 'supremmfact',
                sql: '(SELECT id FROM modw_supremm.percentages_buckets cb WHERE coalesce(100.0 * cpu_user, -1.0) > cb.min AND coalesce(100.0 * cpu_user, -1.0) <= cb.max)',
                label: "CPU User Value",
                dimension_table: "percentages_buckets"
            }, {
                    name: 'cpu_usage_weight',
                    table: 'supremmfact',
                    type: 'double',
                    dimension: false,
                    sql: getWeightMetric('cpu_user', 'cores'),
                    comments: 'The core weight for jobs with cpu user values that ran during the period'
            }]
        },
        error: {
            unit: null,
            type: "string",
            length: 1000,
            nullable: true,
            def: null,
            comments: "a string",
            per: "job",
            table: "job"
        },

        flops: {
            unit: "ops",
            type: "double",
            name: "FLOPS",
            group: "CPU Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "The total number of floating point operations on average per core",
            per: "core",
            raw_per: "core",
            algorithm: "$ frac{  sum limits_{i=1}^N x_i } { N }$ where $x_i$ are the number of floating point operations for each one of the $N$ cores the job ran on",
            algorithm_description: "mean number of floating point operations",
            typical_usage: "Popular measure of computing power in the HPC world.",
            table: "job",
            agg: [ {
                name: 'flop',
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: getSumMetric('flops'),
                comments: 'The total floating point operations per core in this period.',
                stats: [ {
                    name: "avg_flops_per_core",
                    sql: 'sum(jf.flop / jf.wall_time * jf.flop_weight)/sum(jf.flop_weight)',
                    requirenotnull: 'jf.flop',
                    label: 'Avg: FLOPS: Per Core weighted by core-hour',
                    unit: 'ops/s',
                    description: 'The average number of floating point operations per second per core over all jobs that ran in the selected time period.'
                } ]
            }, {
                name: 'flop_weight',
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: getWeightMetric('flops', 'cores'),
                comments: 'The core weight for jobs with flops counts that ran during the period'
            }]
        },

        flops_cov: {
            unit: "ratio",
            type: "double",
            group: "CPU Statistics",
            nullable: true,
            name: "FLOPS cov",
            def: null,
            batchExport: true,
            comments: "Coefficient of variation of the average FLOPS for each core",
            per: "job",
            table: "job",
        },

        cpiref: {
            unit: "ratio",
            type: "double",
            name: "CPI (ref)",
            group: "CPU Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "The number of cpu clock ticks per instruction on average per core.",
            per: "core",
            raw_per: "core",
            algorithm: "$ frac{ N_{ticks} } { N_{instructions} }$",
            algorithm_description: "total number of clock ticks divived by total instruction averaged over all cores.",
            typical_usage: "Measure of processing efficiency (smaller is better)",
            table: "job",
            agg: [
                {
                    name: 'cpiref_weighted_by_coreseconds',
                    table: 'supremmfact',
                    type: 'double',
                    dimension: false,
                    sql: 'sum(cpiref * cores * ' + wallduration_case_statement + ')',
                    comments: 'Total cpiref core seconds.',
                    stats: [{
                        name: "avg_cpiref_per_core",
                        sql: 'sum(jf.cpiref_weighted_by_coreseconds / jf.wall_time / jf.cores * jf.cpiref_weight)/sum(jf.cpiref_weight)',
                        requirenotnull: 'jf.cpiref_weighted_by_coreseconds',
                        decimals: 2,
                        label: 'Avg: CPI: Per Core weighted by core-hour',
                        unit: 'CPI',
                        description: 'The average ratio of clock ticks to instructions per core weighted by core-hour. The CPI is calculated using the reference processor clock.'
                    }]
                },
                {
                    name: 'cpibucket_id',
                    type: 'int32',
                    alias: 'cpi',
                    roles: { disable: [ "pub" ] },
                    dimension: true,
                    table: 'supremmfact',
                    sql: '(SELECT id FROM modw_supremm.cpibuckets cb WHERE coalesce(cpiref, -1.0) > cb.min_cpi AND coalesce(cpiref, -1.0) <= cb.max_cpi)',
                    label: "CPI Value",
                    category: "Metrics",
                    dimension_table: "cpibuckets"
                },
                {
                    name: 'cpiref_weight',
                    type: 'double',
                    dimension: false,
                    table: 'supremmfact',
                    sql: getWeightMetric('cpiref', 'cores'),
                    comments: 'The weight for jobs with cpi counts that ran during the period'
                }
            ]
        },

        cpiref_cov: {
            unit: "ratio",
            name: "CPI (ref) cov",
            type: "double",
            group: "CPU Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "Coefficient of variation of the average CPI for each core",
            per: "job",
            table: "job",
        },

        catastrophe: {
            unit: "ratio",
            type: "double",
            dtype: 'ignore',
            nullable: true,
            def: null,
            batchExport: true,
            comments: "indicator L1D cache load drop off (smaller is worse)",
            per: "job",
            typical_usage: "Measure of catastrophic job failure (smaller is higher probabilty of failure)",
            table: "job",
            agg: [ {
                    name: 'catastrophe_bucket_id',
                    type: 'int32',
                    roles: { disable: [ "pub" ] },
                    dimension: true,
                    table: 'supremmfact',
                    sql: '(SELECT id FROM modw_supremm.catastrophe_buckets cb WHERE coalesce(catastrophe, -1.0) > cb.min AND coalesce(catastrophe, -1.0) <= cb.max)',
                    label: "Catastrophe Rank",
                    category: "Metrics",
                    dimension_table: "catastrophe_buckets"
            } ]
        },

        cpldref: {
            unit: "ratio",
            type: "double",
            name: "CPLD (ref)",
            group: "CPU Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "The ratio of clock ticks to L1D cache load on average per core. The CPLD is calculated using the reference processor clock.",
            per: "core",
            raw_per: "core",
            algorithm: "$ frac{ N_{ticks} } { N_{l1d loads} }$",
            algorithm_description: "total number of clock ticks divived by total L1D cache loads averaged over all cores.",
            typical_usage: "Inverse measure of work rate (smaller is better)",
            table: "job",
            agg: [
                {
                    name: 'cpldref_weighted_by_coreseconds',
                    table: 'supremmfact',
                    type: 'double',
                    dimension: false,
                    sql: 'sum(cpldref * cores * ' + wallduration_case_statement + ')',
                    comments: 'Total cpldref core seconds.',
                    stats: [{
                        name: "avg_cpldref_per_core",
                        sql: 'sum(jf.cpldref_weighted_by_coreseconds / jf.wall_time / jf.cores * jf.cpldref_weight)/sum(jf.cpldref_weight)',
                        requirenotnull: 'jf.cpldref_weighted_by_coreseconds',
                        decimals: 4,
                        label: 'Avg: CPLD: Per Core weighted by core-hour',
                        unit: 'CPLD',
                        description: 'The average ratio of clock ticks to L1D cache loads per core weighted by core-hour. The CPLD is calculated using the reference processor clock.'
                    }]
                }, {
                    name: 'cpldref_weight',
                    type: 'double',
                    dimension: false,
                    table: 'supremmfact',
                    sql: getWeightMetric('cpldref', 'cores'),
                    comments: 'The weight for jobs with cpld counts that ran during the period'
                }
            ]
        },

        cpldref_cov: {
            unit: "ratio",
            type: "double",
            name: "CPLD (ref) cov",
            group: "CPU Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "Coefficient of variation of the average CPLD for each core",
            per: "job",
            table: "job",
        },

        node_cpu_idle: {
            unit: 'ratio',
            type: 'double',
            name: 'Node CPU idle',
            nullable: true,
            group: 'CPU Statistics',
            def: null,
            batchExport: true,
            comments: 'The average CPU idle for all of the CPU cores on the nodes that were assigned to the job. For jobs that were assigned all cores on the nodes this value will be identical to the CPU Idle value.',
            per: 'node',
            table: 'job'
        },

        energy: {
            unit: 'joules',
            type: 'double',
            name: 'Energy',
            nullable: true,
            group: 'Energy Usage Statistics',
            def: null,
            batchExport: true,
            comments: 'An estimate of the amount of energy consumed by the compute nodes on which the job ran. This value does not include the energy used by any external cooling equipment. Nor does it include the energy usage of other components such as filesystem servers and network switches',
            per: 'node',
            table: 'job'
        },

        max_power: {
            unit: 'watts',
            type: 'double',
            name: 'Max Power',
            nullable: true,
            group: 'Energy Usage Statistics',
            def: null,
            batchExport: true,
            comments: 'An estimate of the maximum power consumption of the compute node with largest maximum power consumption during the job.',
            per: 'node',
            table: 'job'
        },

        mem_transferred: {
            unit: "bytes",
            type: "double",
            name: "Memory Transferred",
            nullable: true,
            group: "Memory Statistics",
            def: null,
            batchExport: true,
            comments: "total data transferred over the memory bus",
            per: "core",
            raw_per: "core",
            algorithm: "$ \sum{ m_i } / N$",
            algorithm_description: "total amount of data transferred over the memory bus on average per core",
            typical_usage: "Measure main memory usage",
            table: "job",
            agg: [
                {
                    table: 'supremmfact',
                    type: 'double',
                    dimension: false,
                    sql: getSumMetric('mem_transferred'),
                    comments: 'Total memory transferred.',
                    stats: [{
                        name: "avg_mem_bw_per_core",
                        sql: 'sum(jf.mem_transferred / jf.wall_time / jf.cores * jf.mem_transferred_weight)/sum(jf.mem_transferred_weight)',
                        requirenotnull: 'jf.mem_transferred',
                        label: 'Avg: Memory Bandwidth: Per Core weighted by core-hour',
                        unit: 'bytes/s',
                        description: 'The average main-memory transfer rate per core weighted by core-hour.'
                    }]
                }, {
                    name: 'mem_transferred_weight',
                    type: 'double',
                    dimension: false,
                    table: 'supremmfact',
                    sql: getWeightMetric('mem_transferred', 'cores'),
                    comments: 'The weight for jobs with mem_transferred counts that ran during the period'
                }
            ]
        },

        mem_transferred_cov: {
            unit: "ratio",
            type: "double",
            name: "Memory Transferred cov",
            group: "Memory Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "Coefficient of variation of the average memory transferred for each socket",
            per: "job",
            table: "job",
        },

        cpu_user_cv: {
            unit: "ratio",
            type: "double",
            name: "CPU User cov",
            group: "CPU Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "Coefficient of variation for the CPU user for all cores that were assigned to the job.",
            per: "core",
            raw_per: "core",
            algorithm: "$ frac{ \\sigma }{ \\mu } $",
            algorithm_description: "Standard deviation divided by the mean of the CPU user on each core",
            typical_usage: "Measure of cpu user variabiliy. 0 == even usage",
            table: "job",
            agg: [
                {
                    name: 'cpu_user_cv_weighted_core_seconds',
                    table: 'supremmfact',
                    type: 'double',
                    dimension: false,
                    sql: 'sum(cpu_user_cv * cores * ' + wallduration_case_statement + ')',
                    comments: 'cpu user CV * core seconds.',
                    stats: [{
                        name: "avg_cpuusercv_per_core",
                        sql: 'sum(jf.cpu_user_cv_weighted_core_seconds / jf.wall_time / jf.cores * jf.cpu_usage_weight)/sum(jf.cpu_usage_weight)',
                        requirenotnull: 'jf.cpu_user_cv_weighted_core_seconds',
                        label: 'Avg: CPU User CV: weighted by core-hour',
                        unit: 'CV',
                        description: 'The average CPU user coefficient of variation weighted by core-hour. The coefficient of variation is defined as the ratio of the standard deviation to the mean'
                    }]
                },
                {
                    name: 'cpu_user_cv_id',
                    type: 'int32',
                    alias: 'cpucv',
                    roles: { disable: [ "pub" ] },
                    dimension: true,
                    table: 'supremmfact',
                    sql: '(SELECT id FROM modw_supremm.cpu_user_cv_buckets cb WHERE coalesce(cpu_user_cv, -1.0) > cb.min AND coalesce(cpu_user_cv, -1.0) <= cb.max)',
                    label: "CPU User CV",
                    category: "Metrics",
                    dimension_table: "cpu_user_cv_buckets"
                },
            ]
        },

        cpu_user_imbalance: {
            unit: "%",
            type: "double",
            dtype: 'ignore',
            nullable: true,
            def: null,
            batchExport: true,
            comments: "max - min / max cpu user over all cores job ran on",
            per: "core",
            raw_per: "core",
            algorithm: "$ 100 frac{ max_{user} - min_{user} } { max_{user} }$",
            algorithm_description: "100 * ( MAX(cpu user) - MIN(cpu user) ) / MAX(cpu user)",
            typical_usage: "Normalized measure of cpu imbalance 0 == well balanced, 100 = worst imbalance",
            table: "job",
            agg: [
                {
                    name: 'cpu_user_imbalance_weighted_core_seconds',
                    table: 'supremmfact',
                    type: 'double',
                    dimension: false,
                    sql: 'sum(cpu_user_imbalance * cores * ' + wallduration_case_statement + ')',
                    comments: 'Total cpu user imbalance core seconds.',
                    stats: [{
                        name: "avg_cpuuserimb_per_core",
                        sql: 'sum(jf.cpu_user_imbalance_weighted_core_seconds / jf.wall_time / jf.cores * jf.cpu_usage_weight)/sum(jf.cpu_usage_weight)',
                        requirenotnull: 'jf.cpu_user_imbalance_weighted_core_seconds',
                        label: 'Avg: CPU User Imbalance: weighted by core-hour',
                        unit: '%',
                        description: 'The average normalized CPU user imbalance weighted by core-hour. Imbalance is defined as 100*(max-min)/max, where max is value of the CPU user for the CPU with the largest CPU user.'
                    }]
                },
            ]
        },

        memory_used: {
            unit: "bytes",
            type: "double",
            nullable: true,
            group: "Memory Statistics",
            def: null,
            batchExport: true,
            comments: "Process memory used. This value indicates the memory used by all processes including system services. It does not include the memory used by the OS page or buffer cache. This is the sum of all the process memory on all of the nodes.",
            developer_comment: "The memory usage in the database is the per core value. This is converted to the total value before display to the user",
            per: "core",
            raw_per: "node",
            algorithm: "$ frac{  sum limits_{i=1}^H  frac{ x_{i} }{ C_i } } { H }$ where $x_i$ is the mean memory used on node $i$ $C_i$ is the number of cores on node $i$ and $H$ is the number of nodes on which the job ran",
            algorithm_description: "mean value of the mean node memory used for each node divided by the number of cores per node",
            typical_usage: "Measure of how much memory the job used",
            table: "job",
            agg: [{
                name: 'mem_used_weighted_by_duration',
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: 'sum(memory_used * cores * ' + wallduration_case_statement + ')',
                comments: 'The total memory seconds used in byte seconds in this period. This value indicates the memory used by all processes including system services. It does not include the memory used by the OS page or buffer cache.',
                stats: [{
                    name: "avg_memory_per_core",
                    sql: 'sum(jf.mem_used_weighted_by_duration / jf.wall_time / jf.cores * jf.mem_usage_weight)/sum(jf.mem_usage_weight)',
                    requirenotnull: 'jf.mem_used_weighted_by_duration',
                    label: 'Avg: Memory: Per Core weighted by core-hour',
                    unit: 'bytes',
                    description: 'The average memory used per core for all selected jobs that ran in the selected time period'
                }]
                }, {
                    name: 'mem_usage_weight',
                    table: 'supremmfact',
                    type: 'double',
                    dimension: false,
                    sql: getWeightMetric('memory_used', 'cores'),
                    comments: 'The core weight for jobs with memory usage values that ran during the period'
            }]
        },

        memory_used_cov: {
            unit: "ratio",
            type: "double",
            group: "Memory Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "Coefficient of variation of the average memory used",
            per: "job",
            table: "job",
        },

        max_memory: {
            unit: "ratio",
            type: "double",
            nullable: true,
            group: "Memory Statistics",
            name: "Peak Memory Usage Ratio",
            def: null,
            batchExport: true,
            comments: "Maximum ratio of memory used to total memory available for the compute node with the highest peak memory usage",
            per: "node",
            raw_per: "node",
            typical_usage: "Measure of peak memory usage for the job.",
            table: "job",
            agg: [{
                name: 'max_mem_bucketid',
                type: 'int32',
                alias: 'max_mem',
                roles: {
                    disable: ["pub"]
                },
                dimension: true,
                category: 'Metrics',
                table: 'supremmfact',
                sql: '(SELECT id FROM modw_supremm.percentages_buckets cb WHERE coalesce(100.0 * max_memory, -1.0) > cb.min AND coalesce(100.0 * max_memory, -1.0) <= cb.max)',
                label: "Peak Memory Usage (%)",
                dimension_table: "percentages_buckets"
            }]
        },

        mem_used_including_os_caches: {
            unit: "bytes",
            type: "double",
            nullable: true,
            group: "Memory Statistics",
            name: "Total memory used",
            def: null,
            batchExport: true,
            comments: "Total memory used by the OS including the page and buffer caches. This is the sum of all the memory used on all of the nodes.",
            developer_comment: "The memory usage in the database is the per core value. This is converted to the total value before display to the user",
            per: "core",
            raw_per: "node",
            algorithm: "$ frac{  sum limits_{i=1}^H  frac{ x_{i} }{ C_i } } { H }$ where $x_i$ is the mean total memory active on node $i$ $C_i$ is the number of cores on node $i$ and $H$ is the number of nodes on which the job ran",
            algorithm_description: "mean value of the mean node total memory active for each node divided by the number of cores per node",
            typical_usage: "If the system uses Linux kernel then this value is expected to be approximately the same as the total physical memory on the node. This metric can therefore be used as a consistency check since it has a known expected value.",
            table: "job",
            agg: [{
                name: 'mem_used_including_os_caches_weighted_by_duration',
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: 'sum(mem_used_including_os_caches * cores * ' + wallduration_case_statement + ')',
                comments: 'The total memory seconds used in byte seconds by the OS including the page and buffer caches in this period.',
                stats: [{
                    name: "avg_total_memory_per_core",
                    sql: 'sum(jf.mem_used_including_os_caches_weighted_by_duration / jf.wall_time / jf.cores * jf.mem_usage_weight)/sum(jf.mem_usage_weight)',
                    requirenotnull: 'jf.mem_used_including_os_caches_weighted_by_duration',
                    label: 'Avg: Total Memory: Per Core weighted by core-hour',
                    unit: 'bytes',
                    description: 'The average total memory used (including kernel and disk cache) per core for all selected jobs that ran in the selected time period'
                }]
                }
            ]
        },

        mem_used_including_os_caches_cov: {
            unit: "ratio",
            type: "double",
            name: "Total memory used cov",
            group: "Memory Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "Coefficient of variation of the average memory in use by the OS",
            per: "job",
            table: "job",
        },

        "ib_rx_bytes": {
            unit: "bytes",
            type: "double",
            nullable: true,
            group: "Network I/O Statistics",
            def: null,
            batchExport: true,
            comments: "number of bytes received per node over the data interconnect",
            per: "node",
            raw_per: "node",
            algorithm: "",
            algorithm_description: "",
            typical_usage: "",
            table: "job",
            agg: [{
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: 'sum(' + getDistributionSQLCaseStatement('(ib_rx_bytes * nodecount_id)', ':seconds', 'start_time_ts', 'end_time_ts', ":period_start_ts", ":period_end_ts") + ')',
                comments: 'The total bytes per second written by block devices in this period.',
                stats: [{
                    name: "avg_ib_rx_bytes",
                    sql: 'sum(ib_rx_bytes / jf.wall_time / jf.nodecount_id * jf.ib_rx_bytes_weight)/sum(jf.ib_rx_bytes_weight)',
                    requirenotnull: 'jf.ib_rx_bytes',
                    label: 'Avg: InfiniBand rate: Per Node weighted by node-hour',
                    unit: 'bytes/s',
                    description: 'Average number of bytes received per second per node over the data interconnect. This value only includes the inter-node data transfers and does not count any other data over the interconnect (for example parallel filesystem data).'
                }]
                }, {
                    name: 'ib_rx_bytes_weight',
                    table: 'supremmfact',
                    type: 'double',
                    dimension: false,
                    sql: 'sum( case when ( ib_rx_bytes IS NOT NULL) then 1.0 else 0.0 end * nodecount_id * ' + wallduration_case_statement + ')',
                    comments: 'The node weight for jobs with ib_rx_bytes counts that ran during this period'
                }, {
                    name: 'ibrxbyterate_bucket_id',
                    type: 'int32',
                    roles: { disable: [ "pub" ] },
                    dimension: true,
                    table: 'supremmfact',
                    sql: '(SELECT id FROM modw_supremm.logscalebytes_buckets cb WHERE coalesce(ib_rx_bytes/wall_time, -1.0) > cb.min AND coalesce(ib_rx_bytes/wall_time, -1.0) <= cb.max)',
                    label: "InfiniBand Receive rate",
                    category: "Metrics",
                    dimension_table: "logscalebytes_buckets"
                }
            ]
        },

        "block_(sd[a-z])_wr_ios": {
            unit: "ops",
            type: "double",
            name: "Block device \":label_1\" write operations",
            group: "File I/O Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "The average number of write operations per node for block device :label_1.",
            per: "node",
            raw_per: "node",
            algorithm: "",
            algorithm_description: "",
            typical_usage: "",
            table: "job",
            agg: [{
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: getSumMetric(':field_name * nodecount_id'),
                comments: 'The total number of write io operations by block devices in this period.',
                stats: [{
                    name: "avg_:field_name",
                    sql: 'sum(:field_name / jf.wall_time / jf.nodecount_id * jf.:field_name_weight)/sum(jf.:field_name_weight)',
                    requirenotnull: 'jf.:field_name',
                    label: 'Avg: block :label_1 write ops rate: Per Node weighted by node-hour',
                    unit: 'ops/s',
                    description: 'Average number of write operations per second per node for the local hard disk device :label_1.'
                }]
                }, {
                    name: ':field_name_weight',
                    table: 'supremmfact',
                    type: 'double',
                    dimension: false,
                    sql: 'sum( case when ( :field_name IS NOT NULL) then 1.0 else 0.0 end * nodecount_id * ' + wallduration_case_statement + ')',
                    comments: 'The node weight for jobs with :field_name counts that ran during this period'
                }
            ]
        },
        "block_(sd[a-z])_wr_bytes": {
            unit: "bytes",
            type: "double",
            name: "Block device \":label_1\" data written",
            group: "File I/O Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "The average number of bytes written per node to block device :label_1.",
            per: "node",
            raw_per: "node",
            algorithm: "",
            algorithm_description: "",
            typical_usage: "",
            table: "job",
            agg: [{
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: 'sum(' + getDistributionSQLCaseStatement('(:field_name * nodecount_id)', ':seconds', 'start_time_ts', 'end_time_ts', ":period_start_ts", ":period_end_ts") + ')',
                comments: 'The total bytes per second written by block devices in this period.',
                stats: [{
                    name: "avg_:field_name",
                    sql: 'sum(:field_name / jf.wall_time / jf.nodecount_id * jf.:field_name_weight)/sum(jf.:field_name_weight)',
                    requirenotnull: 'jf.:field_name',
                    label: 'Avg: block :label_1 write rate: Per Node weighted by node-hour',
                    unit: 'bytes/s',
                    description: 'Average number of bytes written per second per node to the local hard disk device :label_1.'
                }]
                }, {
                    name: ':field_name_weight',
                    table: 'supremmfact',
                    type: 'double',
                    dimension: false,
                    sql: 'sum( case when ( :field_name IS NOT NULL) then 1.0 else 0.0 end * nodecount_id * ' + wallduration_case_statement + ')',
                    comments: 'The node weight for jobs with :field_name counts that ran during this period'
                }
            ]
        },

        "block_(sd[a-z])_wr_bytes_cov": {
            unit: "ratio",
            type: "double",
            name: "Block device \":label_1\" data written cov",
            group: "File I/O Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "Coefficient of variation of the average data written to block device :label_1",
            per: "job",
            table: "job",
        },

        "block_(sd[a-z])_rd_ios": {
            unit: "ops",
            type: "double",
            name: "Block device \":label_1\" read operations",
            group: "File I/O Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "The average number of read operations per node for block device :label_1.",
            per: "node",
            raw_per: "node",
            algorithm: "",
            algorithm_description: "",
            typical_usage: "",
            table: "job",
            agg: [{
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: 'sum(' + getDistributionSQLCaseStatement('(:field_name * nodecount_id)', ':seconds', 'start_time_ts', 'end_time_ts', ":period_start_ts", ":period_end_ts") + ')',
                comments: 'The total number of read io operations per second by block devices in this period.',
                stats: [{
                    name: "avg_:field_name",
                    sql: 'sum(:field_name / jf.wall_time / jf.nodecount_id * jf.:field_name_weight)/sum(jf.:field_name_weight)',
                    requirenotnull: 'jf.:field_name',
                    label: 'Avg: block :label_1 read ops rate: Per Node weighted by node-hour',
                    unit: 'ops/s',
                    description: 'Average number of read operations per second per node for the local hard disk device :label_1.'
                }]
                }, {
                    name: ':field_name_weight',
                    table: 'supremmfact',
                    type: 'double',
                    dimension: false,
                    sql: 'sum( case when ( :field_name IS NOT NULL) then 1.0 else 0.0 end * nodecount_id * ' + wallduration_case_statement + ')',
                    comments: 'The node weight for jobs with :field_name counts that ran during this period'
                }
            ]
        },
        "block_(sd[a-z])_rd_bytes": {
            unit: "bytes",
            type: "double",
            name: "Block device \":label_1\" data read",
            group: "File I/O Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "The average amount of data read per node from block device :label_1.",
            per: "node",
            raw_per: "node",
            algorithm: "",
            algorithm_description: "",
            typical_usage: "",
            table: "job",
            agg: [{
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: 'sum(' + getDistributionSQLCaseStatement('(:field_name * nodecount_id)', ':seconds', 'start_time_ts', 'end_time_ts', ":period_start_ts", ":period_end_ts") + ')',
                comments: 'The total bytes per second read by block devices in this period.',
                stats: [{
                    name: "avg_:field_name",
                    sql: 'sum(jf.:field_name / jf.wall_time / jf.nodecount_id * jf.:field_name_weight)/sum(jf.:field_name_weight)',
                    requirenotnull: 'jf.:field_name',
                    label: 'Avg: block :label_1 read rate: Per Node weighted by node-hour',
                    unit: 'bytes/s',
                    description: 'Average number of bytes read per second per node from the local hard disk device :label_1.'
                }]
                }, {
                    name: ':field_name_weight',
                    table: 'supremmfact',
                    type: 'double',
                    dimension: false,
                    sql: 'sum( case when ( :field_name IS NOT NULL) then 1.0 else 0.0 end * nodecount_id * ' + wallduration_case_statement + ')',
                    comments: 'The node weight for jobs with :field_name counts that ran during this period'
                }
            ]
        },

        "block_(sd[a-z])_rd_bytes_cov": {
            unit: "ratio",
            name: "Block device \":label_1\" data read cov",
            group: "File I/O Statistics",
            type: "double",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "Coefficient of variation of the average data read from block device :label_1",
            per: "job",
            table: "job",
        },

        'netdir_(projects|util|work|scratch|home)_read': {
            unit: "bytes",
            type: "double",
            name: "Mount point \":label_1\" data read",
            group: "File I/O Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "Average number of bytes per node read from filesystem device :label_1",
            per: "node",
            raw_per: "node",
            algorithm: "",
            algorithm_description: "",
            typical_usage: "",
            table: "job"
        },

        'netdir_(projects|util|work|scratch|home)_write': {
            unit: "bytes",
            type: "double",
            name: "Mount point \":label_1\" data written",
            group: "File I/O Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "The average number of bytes written per node to mount point :label_1.",
            per: "node",
            raw_per: "node",
            algorithm: "",
            algorithm_description: "",
            typical_usage: "",
            table: "job",
            agg: [{
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: 'sum(' + getDistributionSQLCaseStatement('(:field_name * nodecount_id)', ':seconds', 'start_time_ts', 'end_time_ts', ":period_start_ts", ":period_end_ts") + ')',
                comments: 'The total bytes rwritten to network dir i in this period.',
                stats: [{
                    name: "avg_:field_name",
                    sql: 'sum(jf.:field_name / jf.wall_time / jf.nodecount_id * jf.:field_name_weight)/sum(jf.:field_name_weight)',
                    requirenotnull: 'jf.:field_name',
                    label: 'Avg: /:label_1 write rate: Per Node weighted by node-hour',
                    unit: 'bytes/s',
                    description: 'Average number of bytes written per second per node for the filesystem mounted on mount point /:label_1'
                }]
            }, {
                    name: ':field_name_weight',
                    table: 'supremmfact',
                    type: 'double',
                    dimension: false,
                    sql: 'sum( case when ( :field_name IS NOT NULL) then 1.0 else 0.0 end * nodecount_id * ' + wallduration_case_statement + ')',
                    comments: 'The node weight for jobs with :field_name counts that ran during this period'
                }
            ]
        },

        'netdir_(projects|util|work|scratch|home)_write_cov': {
            unit: "ratio",
            type: "double",
            name: "Mount point \":label_1\" data written cov",
            group: "File I/O Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "Coefficient of variation of the average bytes written to the :label_1 filesystem",
            per: "job",
            table: "job",
        },

        "netdrv_([a-z]+)_rx": {
            unit: "bytes",
            type: "double",
            name: "Parallel filesystem :label_1 bytes received",
            group: "Network I/O Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "total number of bytes received per node from the :label_1 filesystem.",
            per: "node",
            raw_per: "node",
            algorithm: "",
            algorithm_description: "",
            typical_usage: "",
            table: "job",
            agg: [{
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: 'sum(' + getDistributionSQLCaseStatement('(:field_name * nodecount_id)', ':seconds', 'start_time_ts', 'end_time_ts', ":period_start_ts", ":period_end_ts") + ')',
                comments: 'The total bytes received by network drive i in this period.',
                stats: [{
                    name: "avg_:field_name",
                    sql: 'sum(jf.:field_name / jf.wall_time / jf.nodecount_id * jf.:field_name_weight)/sum(jf.:field_name_weight)',
                    requirenotnull: 'jf.:field_name',
                    label: 'Avg: :label_1 receive rate: Per Node weighted by node-hour',
                    unit: 'bytes/s',
                    description: 'Average number of bytes received per second per node from the :label_1 filesystem.'
                }]
            }, {
                    name: ':field_name_weight',
                    table: 'supremmfact',
                    type: 'double',
                    dimension: false,
                    sql: 'sum( case when ( :field_name IS NOT NULL) then 1.0 else 0.0 end * nodecount_id * ' + wallduration_case_statement + ')',
                    comments: 'The node weight for jobs with :field_name counts that ran during this period'
                },
                {
                    name: ':field_name_bucket_id',
                    type: 'int32',
                    roles: { disable: [ "pub" ] },
                    dimension: true,
                    table: 'supremmfact',
                    sql: '(SELECT id FROM modw_supremm.log2scale_buckets cb WHERE coalesce(:field_name*nodes, -1.0) > cb.min AND coalesce(:field_name*nodes, -1.0) <= cb.max)',
                    label: ":label_1 bytes received",
                    category: "Metrics",
                    dimension_table: "log2scale_buckets"
                }
            ]
        },

        "netdrv_([a-z]+)_rx_cov": {
            unit: "ratio",
            type: "double",
            name: "Parallel filesystem :label_1 bytes received cov",
            group: "Network I/O Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "Coefficient of variation of the average bytes read from the :label_1 parallel filesystem for each node.",
            per: "job",
            table: "job",
        },

        "netdrv_([a-z]+)_rx_msgs": {
            unit: "messages",
            type: "double",
            name: "Parallel filesystem :label_1 messages received",
            group: "Network I/O Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "number of messages received by network drive i averaged across nodes, i.e. lnet.-.rx_msgs",
            per: "node",
            raw_per: "node",
            algorithm: "",
            algorithm_description: "",
            typical_usage: "",
            table: "job"
        },
        "netdrv_([a-z]+)_tx": {
            unit: "bytes",
            type: "double",
            nullable: true,
            name: "Parallel filesystem :label_1 bytes transmitted",
            group: "Network I/O Statistics",
            def: null,
            batchExport: true,
            comments: "number of bytes transmitted by network drive i averaged across nodes, i.e. lnet.-.tx_bytes",
            per: "node",
            raw_per: "node",
            algorithm: "",
            algorithm_description: "",
            typical_usage: "",
            table: "job",
            agg: [{
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: 'sum(' + getDistributionSQLCaseStatement('(:field_name * nodecount_id)', ':seconds', 'start_time_ts', 'end_time_ts', ":period_start_ts", ":period_end_ts") + ')',
                comments: 'The total number of bytes transmitted by network drive i in this period.',
                stats: [{
                    name: "avg_:field_name",
                    sql: 'sum(jf.:field_name / jf.wall_time / jf.nodecount_id * jf.:field_name_weight)/sum(jf.:field_name_weight)',
                    requirenotnull: 'jf.:field_name',
                    label: 'Avg: :label_1 transmit rate: Per Node weighted by node-hour',
                    unit: 'bytes/s',
                    description: 'Average number of bytes transmitted per second per node to the :label_1 filesystem.'
                }]
            }, {
                    name: ':field_name_weight',
                    table: 'supremmfact',
                    type: 'double',
                    dimension: false,
                    sql: 'sum( case when ( :field_name IS NOT NULL) then 1.0 else 0.0 end * nodecount_id * ' + wallduration_case_statement + ')',
                    comments: 'The node weight for jobs with :field_name counts that ran during this period'
                }
            ]
        },
        "netdrv_([a-z]+)_tx_cov": {
            unit: "ratio",
            type: "double",
            name: "Parallel filesystem :label_1 bytes transmitted cov",
            group: "Network I/O Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "Coefficient of variation of the average bytes written to the :label_1 parallel filesystem for each node.",
            per: "job",
            table: "job",
        },
        "netdrv_([a-z]+)_tx_msgs": {
            unit: "messages",
            type: "double",
            nullable: true,
            name: "Parallel filesystem :label_1 messages transmitted",
            group: "Network I/O Statistics",
            def: null,
            batchExport: true,
            comments: "number of messages transmitted by network drive i averaged across nodes, i.e. lnet.-.tx_msgs",
            per: "node",
            raw_per: "node",
            algorithm: "",
            algorithm_description: "",
            typical_usage: "",
            table: "job"
        },


        "net_([a-z]+[0-9]+)_rx": {
            unit: "bytes",
            type: "double",
            nullable: true,
            def: null,
            group: "Network I/O Statistics",
            batchExport: true,
            comments: "number of bytes received by network via network interface i averaged across nodes, i.e. net.ib0.rx_bytes",
            per: "node",
            raw_per: "node",
            algorithm: "",
            algorithm_description: "",
            typical_usage: "",
            table: "job",
            agg: [{
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: 'sum(' + getDistributionSQLCaseStatement('(:field_name * nodecount_id)', ':seconds', 'start_time_ts', 'end_time_ts', ":period_start_ts", ":period_end_ts") + ')',
                comments: 'The total number of bytes received by network via network interface i in this period.',
                stats: [{
                    name: "avg_:field_name",
                    sql: 'sum(jf.:field_name / jf.wall_time / jf.nodecount_id * jf.:field_name_weight)/sum(jf.:field_name_weight)',
                    requirenotnull: 'jf.:field_name',
                    label: 'Avg: :label_1 receive rate: Per Node weighted by node-hour',
                    unit: 'bytes/s',
                    description: 'Average number of bytes received per second per node for network device :label_1'
                }]
            }, {
                    name: ':field_name_weight',
                    table: 'supremmfact',
                    type: 'double',
                    dimension: false,
                    sql: 'sum( case when ( :field_name IS NOT NULL) then 1.0 else 0.0 end * nodecount_id * ' + wallduration_case_statement + ')',
                    comments: 'The node weight for jobs with :field_name counts that ran during this period'
                }
            ]
        },
        "net_([a-z]+[0-9]+)_rx_cov": {
            unit: "ratio",
            type: "double",
            nullable: true,
            group: "Network I/O Statistics",
            def: null,
            batchExport: true,
            comments: "Coefficient of variation of the average bytes received by the network device :label_1 for each node.",
            per: "job",
            table: "job",
        },
        "net_([a-z]+[0-9]+)_rx_packets": {
            unit: "packets",
            type: "double",
            nullable: true,
            group: "Network I/O Statistics",
            def: null,
            batchExport: true,
            comments: "number of packets received by network via network interface i averaged across nodes",
            per: "node",
            raw_per: "node",
            algorithm: "",
            algorithm_description: "",
            typical_usage: "",
            table: "job"
        },
        "net_([a-z]+[0-9]+)_tx": {
            unit: "bytes",
            type: "double",
            nullable: true,
            group: "Network I/O Statistics",
            def: null,
            batchExport: true,
            comments: "number of bytes transmitted by network via network interface i averaged across nodes",
            per: "node",
            raw_per: "node",
            algorithm: "",
            algorithm_description: "",
            typical_usage: "",
            table: "job",
            agg: [{
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: 'sum(' + getDistributionSQLCaseStatement('(:field_name * nodecount_id)', ':seconds', 'start_time_ts', 'end_time_ts', ":period_start_ts", ":period_end_ts") + ')',
                comments: 'The total number of bytes transmitted by by network via network interface i in this period.',
                stats: [{
                    name: "avg_:field_name",
                    sql: 'sum(jf.:field_name / jf.wall_time / jf.nodecount_id * jf.:field_name_weight)/sum(jf.:field_name_weight)',
                    requirenotnull: 'jf.:field_name',
                    label: 'Avg: :label_1 transmit rate: Per Node weighted by node-hour',
                    unit: 'bytes/s',
                    description: 'Average number of bytes transmitted per second per node for network device :label_1.'
                }]
            }, {
                    name: ':field_name_weight',
                    table: 'supremmfact',
                    type: 'double',
                    dimension: false,
                    sql: 'sum( case when ( :field_name IS NOT NULL) then 1.0 else 0.0 end * nodecount_id * ' + wallduration_case_statement + ')',
                    comments: 'The node weight for jobs with :field_name counts that ran during this period'
                }
            ]
        },
        "net_([a-z]+[0-9]+)_tx_cov": {
            unit: "ratio",
            type: "double",
            group: "Network I/O Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "Coefficient of variation of the average bytes transmitted by the network device :label_1 for each node.",
            per: "job",
            table: "job",
        },
        "net_([a-z]+[0-9]+)_tx_packets": {
            unit: "packets",
            type: "double",
            group: "Network I/O Statistics",
            nullable: true,
            def: null,
            batchExport: true,
            comments: "number of packets transmitted by network via network interface i averaged across nodes",
            per: "node",
            raw_per: "node",
            algorithm: "",
            algorithm_description: "",
            typical_usage: "",
            table: "job"
        },

        gpu_energy: {
            unit: 'joules',
            type: 'double',
            name: 'GPU Energy',
            nullable: true,
            group: 'Energy Usage Statistics',
            def: null,
            batchExport: true,
            comments: 'An estimate of the amount of energy consumed by the GPU devices that were assigned to the job. This value does not include the energy used by the compute nodes or any other components external to the GPU cards.',
            per: 'node',
            table: 'job'
        },

        gpu_max_power: {
            unit: 'watts',
            type: 'double',
            name: 'GPU Max Power',
            nullable: true,
            group: 'Energy Usage Statistics',
            def: null,
            batchExport: true,
            comments: 'An estimate of the maximum power consumption of the GPU card with the largest maximum power consumption during the job.',
            per: 'gpu',
            table: 'job'
        },

        "gpu([0-9]+)_nv_mem_used": {
            unit: "bytes",
            type: "double",
            name: 'GPU device "gpu:label_1" average memory usage',
            nullable: true,
            group: "Accelerator Statistics",
            def: null,
            batchExport: true,
            comments: "average memory used by gpu i averaged across nodes, only support nvidia.  Could be multiple cards per machine of different types",
            per: "node",
            raw_per: "gpu",
            algorithm: "",
            algorithm_description: "",
            typical_usage: "",
            table: "job"
        },

        'gpu([0-9]+)_nv_utilization': {
            unit: '%',
            type: 'double',
            name: 'GPU device "gpu:label_1" utilization',
            group: 'Accelerator Statistics',
            nullable: true,
            def: null,
            batchExport: true,
            comments: 'average % utilization of the gpu',
            per: 'node',
            raw_per: 'gpu',
            algorithm: '',
            algorithm_description: '',
            typical_usage: '',
            table: 'job',
            agg: [{
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: getSumMetric(':field_name*node_time'),
                comments: 'The amount of gpu time of the jobs pertaining to this period.',
                stats: [{
                    sql: 'sum(jf.:field_name/3600.0)',
                    label: 'GPU:label_1 Hours: Total',
                    requirenotnull: 'jf.:field_name',
                    unit: 'GPU Hour',
                    description: 'The total GPU hours for all jobs that were executing during the time period.'
                }, {
                    name: 'avg_percent_:field_name',
                    sql: 'sum(100.0 * jf.:field_name / jf.node_time * jf.:field_name_weight)/sum(jf.:field_name_weight)',
                    label: 'Avg GPU:label_1 usage: weighted by node-hour',
                    requirenotnull: 'jf.:field_name',
                    unit: 'GPU %',
                    description: 'The average GPU:label_1 usage % weighted by node hours, over all jobs that were executing.'
                }]
            }, {
                name: ':field_name_bucketid',
                type: 'int32',
                roles: { disable: ['pub'] },
                dimension: true,
                category: 'Metrics',
                table: 'supremmfact',
                sql: '(SELECT id FROM modw_supremm.percentages_buckets cb WHERE coalesce(100.0 * :field_name, -1.0) > cb.min AND coalesce(100.0 * :field_name, -1.0) <= cb.max)',
                label: 'GPU:label_1 Usage Value',
                dimension_table: 'percentages_buckets'
            }, {
                name: ':field_name_weight',
                table: 'supremmfact',
                type: 'double',
                dimension: false,
                sql: getWeightMetric(':field_name', 'nodes'),
                comments: 'The node weight for jobs with cpu user values that ran during the period'
            }]
        }
    },
    derivedFieldQueries: {
        jobfact: {
            mapping: {
                tg_job_id: 'job_id',
                person_id: { alias: 'jt' },
                person_organization_id: { alias: 'jt' }
            },
            table: 'modw.job_tasks jt, modw.job_records jr',
            // bind these using the same query format function just replace with attributes.:resource_id.value
            where: 'jt.resource_id = :resource_id and jt.local_job_id_raw = :local_job_id and jt.job_record_id = jr.job_record_id',
            cacheable: false
        },
        account: {
            mapping: {account_id: "id"},
            table: "modw.account",
            where: "charge_number = :account"
        },
        username: {
            mapping: {systemaccount_id: "id"},
            table: "modw.systemaccount",
            where: "resource_id = :resource_id and username = :username"
        },
        executable: {
            mapping: {executable_id: "id"},
            table: "modw_supremm.executable",
            where: "exec_md5 = md5(:executable) and resource_id = :resource_id"
        },
        datasource: {
            mapping: {datasource_id: "id"},
            table: "modw_supremm.datasource",
            where: "description = :datasource"
        },
        application: {
            mapping: {application_id: "id"},
            table: "modw_supremm.application",
            where: "name = :application"
        },
        cwd: {
            mapping: {cwd_id: "id"},
            table: "modw_supremm.cwd",
            where: "cwd_md5 = md5(:cwd) and resource_id = :resource_id"
        },
        exit_status: {
            mapping: {exit_status_id: "id"},
            table: "modw_supremm.exit_status",
            where: "name = :exit_status"
        },
        job_name: {
            mapping: {jobname_id: "id"},
            table: "modw_supremm.job_name",
            where: "name_md5 = md5(:name)"
        },
        nodecount: {
            //mapping: {nodecount_id: "coalesce(:nodes,0)"},
            value: function(attributes) {
                if (attributes.nodes.value !== undefined && attributes.nodes.value !== null) {
                    return attributes.nodes.value;
                } else {
                    return 0;
                }
            }

        },
        queue: {
            //mapping: {nodecount_id: "coalesce(:nodes,0)"},
            value: function(attributes) {
                if (attributes.queue.value !== undefined && attributes.queue.value !== null) {
                    return attributes.queue.value;
                } else {
                    return 'NA';
                }
            }

        }
    },
    derivedFields: {
        tg_job_id: {
            type: "int32",
            nullable: false,
            def: -1,
            comments: "the local job id",
            per: "job",
            table: "job",
            queries: ["jobfact"]
        },
        account_id: {
            type: "int32",
            nullable: false,
            def: -1,
            dtype: "ignore",
            comments: "The name of the account or project (also known as a charge number).",
            per: "job",
            table: "job",
            queries: ['jobfact', 'account'],
            join: {
                schema: 'modw',
                table: 'account',
                column: 'charge_number'
            }
        },
        fos_id: {
            type: "int32",
            name: "config://hierarchy.json:bottom_level_label",
            nullable: false,
            group: "Administration",
            def: -1,
            batchExport: true,
            comments: "config://hierarchy.json:bottom_level_info",
            per: "job",
            table: "job",
            queries: ["jobfact"],
            agg: {
                table: 'supremmfact',
                alias: [ 'fieldofscience', 'nsfdirectorate', 'parentscience' ],
                roles: { disable: [ "pub" ] },
                dimension: true
            },
            join: {
                schema: 'modw',
                table: 'fieldofscience',
                column: 'description'
            }
        },
        systemaccount_id: {
            type: "int32",
            nullable: false,
            def: -1,
            name: "Username",
            group: "Administration",
            visibility: 'non-public',
            batchExport: 'anonymize',
            comments: 'The username on the resource of the user that ran the job. May be a UID or string username depending on the resource.',
            per: "job",
            table: "job",
            queries: ["jobfact", "username"],
            agg: {
                table: 'supremmfact',
                alias: "username",
                roles: { disable: [ "pub" ] },
                dimension: true
            },
            join: {
                schema: 'modw',
                table: 'systemaccount',
                column: 'username'
            }
        },
        person_id: {
            type: "int32",
            nullable: false,
            def: -1,
            name: "User",
            group: "Administration",
            batchExport: true,
            comments: "The name of the job owner.",
            per: "job",
            table: "job",
            queries: ["jobfact"],
            agg: {
                table: 'supremmfact',
                roles: { disable: [ "pub" ] },
                dimension: true
            },
            join: {
                schema: 'modw',
                table: 'person',
                column: 'long_name'
            }
        },
        person_organization_id: {
            type: "int32",
            nullable: false,
            name: "User Institution",
            group: "Administration",
            def: -1,
            comments: "The name of the organization of the job owner.",
            per: "job",
            table: "job",
            queries: ["jobfact"],
            agg: {
                table: 'supremmfact',
                alias: 'institution',
                roles: { disable: [ "pub" ] },
                dimension: true
            },
            join: {
                schema: 'modw',
                table: 'organization'
            }
        },
        principalinvestigator_person_id: {
            type: "int32",
            name: "PI",
            nullable: false,
            group: "Administration",
            def: -1,
            batchExport: true,
            comments: "The PI of the job owner.",
            per: "job",
            table: "job",
            queries: ["jobfact"],
            agg: {
                table: 'supremmfact',
                alias: 'pi',
                roles: { disable: [ "pub" ] },
                dimension: true
            },
            join: {
                schema: 'modw',
                table: 'person',
                column: 'long_name'
            }
        },
        piperson_organization_id: {
            type: "int32",
            name: "PI Institution",
            nullable: false,
            group: "Administration",
            def: -1,
            comments: "The organization of the job owner's PI.",
            per: "job",
            table: "job",
            queries: ["jobfact"],
            agg: {
                table: 'supremmfact',
                alias: 'pi_institution',
                roles: { disable: [ "pub" ] },
                dimension: true
            },
            join: {
                schema: 'modw',
                table: 'organization'
            }
        },
        executable_id: {
            type: "int32",
            nullable: false,
            group: "Executable",
            def: null,
            comments: "The full path to the main job executable.",
            per: "job",
            table: "job",
            queries: ['executable'],
            join: {
                schema: 'modw_supremm',
                table: 'executable',
                column: 'exec'
            }
        },
        cwd_id: {
            type: "int32",
            nullable: false,
            name: "Working directory",
            group: "Executable",
            def: null,
            comments: "The working directory where the main job executable was launched.",
            per: "job",
            table: "job",
            queries: ['cwd'],
            join: {
                schema: 'modw_supremm',
                table: 'cwd',
                column: 'cwd'
            }
        },
        datasource_id: {
            type: "int32",
            nullable: false,
            def: null,
            group: "Other",
            comments: "The software used to collect the performance data.",
            per: "job",
            table: "job",
            queries: ["datasource"],
            agg: {
                table: 'supremmfact',
                roles: { disable: [ "pub" ] },
                dimension: true,
                category: "Metrics",
                dimension_table: "datasource"
            }
        },
        application_id: {
            type: "int32",
            nullable: false,
            def: null,
            group: "Executable",
            comments: "The application that the job ran. This value is autodetected based on the job executable path. A value of uncategorized indicates that the executable path was not recognized as a community application. A value of PROPRIETARY is shown for any application that has a non-open licence agreement that may restrict publishing of performance data. NA means not available.",
            per: "job",
            table: "job",
            queries: ["application"],
            agg: {
                table: 'supremmfact',
                roles: { disable: [ "pub" ] },
                dimension: true
            },
            join: {
                schema: 'modw_supremm',
                table: 'application'
            }
        },
        nodecount_id: {
            type: "int32",
            nullable: false,
            dtype: "ignore",
            def: null,
            batchExport: true,
            comments: "foreign key to the nodecount table.",
            per: "job",
            table: "job",
            queries: ["nodecount"],
            agg: {
                table: 'supremmfact',
                roles: { disable: [ "pub" ] },
                dimension: true
            }
        },
        jobname_id: {
            type: "int32",
            dtype: "ignore",
            nullable: false,
            def: null,
            comments: "foreign key to the jobname table.",
            per: "job",
            table: "job",
            queries: ['job_name'],
            join: {
                schema: 'modw_supremm',
                table: 'job_name'
            }
        },
        exit_status_id: {
            type: "int32",
            nullable: false,
            def: null,
            group: "Executable",
            batchExport: true,
            comments: "The exit status of the job reported by the job scheduler. The meaning of this field depends on the job scheduler.",
            per: "job",
            table: "job",
            queries: ["exit_status"],
            agg: {
                table: 'supremmfact',
                roles: { disable: [ "pub" ] },
                dimension: true
            },
            join: {
                schema: 'modw_supremm',
                table: 'exit_status'
            }
        },
        queue_id: {
            type: "string",
            length: 50,
            nullable: false,
            dtype: "accounting",
            group: "Requested resource",
            def: "NA",
            batchExport: true,
            comments: "The name of the queue to which the job was submitted.",
            per: "job",
            table: "job",
            queries: ["queue"],
            agg: {
                table: 'supremmfact',
                roles: { disable: [ "pub" ] },
                dimension: true
            }
        }
    },
    groupByNoneRoleConfig: {
        disable: [ "pub" ]
    },
    rawStatistics: {
        realmName: 'SUPREMM',
        realmDisplay: 'SUPREMM',
        realmOrder: 10,

        // Include columns from this table in the raw statistics configuration.
        table: 'modw_supremm.job',

        tables: [
            {
                schema: 'modw_supremm',
                name: 'job_errors',
                alias: 'je',
                join: {
                    primaryKey: '_id',
                    foreignTableAlias: 'jf',
                    foreignKey: '_id'
                }
            }
        ],

        // Fields not already defined as part of the ETL schema.
        fields: {
            timezone: {
                name: 'Timezone',
                table: 'job',
                dtype: 'foreignkey',
                group: 'Administration',
                per: 'resource',
                visibility: 'public',
                batchExport: true,
                comments: 'The timezone of the resource.',
                join: {
                    schema: 'modw',
                    table: 'resourcefact',
                    foreignKey: 'resource_id',
                    column: 'timezone'
                }
            },
            homogeneity: {
                name: 'Homogeneity',
                formula: '(1.0 - (1.0 / (1.0 + 1000.0 * jf.catastrophe)))',
                withError: {
                    name: 'homogeneity_error',
                    column: 'catastrophe',
                    tableAlias: 'je'
                },
                unit: 'ratio',
                per: 'job',
                visibility: 'public',
                comments: 'A measure of how uniform the L1D load rate is over the lifetime of the job. ' +
                    'Jobs with a low homogeneity value (~0) should be investigated to check if there ' +
                    'has been a catastrophic failure during the job',
                batchExport: true,
                dtype: 'analysis'
            },
            cpu_user_balance: {
                name: 'CPU User Balance',
                formula: '(1.0 - (jf.cpu_user_imbalance/100.0))',
                withError: {
                    name: 'cpu_user_balance_error',
                    column: 'cpu_user_imbalance',
                    tableAlias: 'je'
                },
                unit: 'ratio',
                per: 'job',
                visibility: 'public',
                comments: 'A measure of how uniform the CPU usage is between the cores that the job was ' +
                    'assigned. A value of CPU User Balance near 1 corresponds to a job with evenly ' +
                    'loaded CPUs. A value near 0 corresponds to a job with one or more CPU cores ' +
                    'with much lower utilization that the others.',
                batchExport: true,
                dtype: 'analysis'
            },
            mem_coefficient: {
                name: 'Memory Headroom',
                formula: '(1.0 - 1.0/POW(2-jf.max_memory, 5))',
                withError: {
                    name: 'mem_coefficient_error',
                    column: 'max_memory',
                    tableAlias: 'je'
                },
                unit: 'ratio',
                per: 'job',
                visibility: 'public',
                comments: 'A measure of the peak compute-node memory usage for the job. A value of 0 corresponds ' +
                    'to a job which used all of the available memory and 1 corresponds to a job with low memory usage. ' +
                    'The value is computed as 1 - 1 / (2 - m)^5, where m is the ratio of memory used to memory available for ' +
                    'the compute node that had the highest memory usage.',
                batchExport: true,
                dtype: 'analysis'
            }
        }
    }
};
