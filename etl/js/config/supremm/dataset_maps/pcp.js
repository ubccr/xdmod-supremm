var app_ident = require('../app_ident.js');
var map_helpers = require('../map_helpers.js');

module.exports = function(config) {
    var appident = app_ident(config.applicationDefn);

    var getHardwareConfig = function (setting, default_val) {
        var val = config.hardware;
        var props = setting.split('.');
        for (let i = 0; i < props.length; i++) {
            if (typeof val !== 'undefined' && val.hasOwnProperty(props[i])) {
                val = val[props[i]];
            } else {
                val = default_val;
                break;
            }
        }
        return val;
    };

    var getProcInfo = function (job) {
        var app = null;

        if (job.procDump && job.procDump.constrained) {
            app = appident(job.procDump.constrained);

            if (!app) {
                app = appident(job.procDump.unconstrained);
            }

            if (!app) {
                if (job.procDump.constrained.length > 0) {
                    return {
                        executable: job.procDump.constrained[0],
                        name: 'uncategorized',
                        realname: 'uncategorized'
                    };
                }
                if (job.procDump.unconstrained.length > 0) {
                    return {
                        executable: job.procDump.unconstrained[0],
                        name: 'uncategorized',
                        realname: 'uncategorized'
                    };
                }
            }
        }

        return app;
    };

    return {
        id: config.resource_id,
        name: config.resource,
        long_name: config.resource,
        gpfs: config.hardware.gpfs,
        nodes: 0,
        ppn: 0,
        start_date: "1970-01-01",
        // The summary documents use compression where the various statistics
        // for a metric are ommitted if they have default values. The avg
        // metric is always provided so that is is possible to determine
        // whether the statistic is mssing due to it being a default value.
        "getcov": function(job, metricname) {
            if (Array.isArray(metricname)) {
                for (var i = 0; i < metricname.length; i++) {
                    var res = this.getcov.call(this, job, metricname[i]);
                    if (res.error === 0) {
                        return res;
                    }
                }
                return {
                    value: null,
                    error: 2
                };
            }
            var cov = this.ref(job, metricname + ".cov");
            if (cov.error === 0) {
                return cov;
            }
            var avg = this.ref(job, metricname + ".avg");
            if (avg.error === 0) {
                // Avg is present but cov absent, therefore cov is default value of 0.0
                return {
                    value: 0.0,
                    error: 0
                };
            }
            return {
                value: null,
                error: cov.error
            };
        },
        "getmax": function(job, metricname) {
            if (Array.isArray(metricname)) {
                for (var i = 0; i < metricname.length; i++) {
                    var res = this.getmax(job, metricname[i]);
                    if (res.error === 0) {
                        return res;
                    }
                }
                return {
                    value: null,
                    error: 2
                };
            }
            var maxval = this.ref(job, metricname + ".max");
            if (maxval.error === 0) {
                return maxval;
            }
            var avg = this.ref(job, metricname + ".avg");
            if (avg.error === 0) {
                // Avg is present but max absent, therefore max is same as avg
                return avg;
            }
            return {
                value: null,
                error: maxval.error
            };
        },

        "devices": {
            "block_sda": {
                "name": "/sda",
                "bytes_per_sector": 512
            },
            "netdrv_isilon": {
                "name": "ifs"
            },
            "netdrv_panasas": {
                "name": "panfs"
            },
            "net_eth0": {
                "name": "em1"
            },
            "net_ib0": {
                "name": "ib0"
            }
        },

        "attributes": {
            "local_job_id": {
                ref: "acct.id"
            },
            "name": {
                ref: "acct.jobname"
            },
            "resource_name": {
                formula: function() {
                    return {value: this.name, error: 0};
                }
            },
            "resource_id": {
                formula: function() {
                    return {value: this.id, error: 0};
                }
            },
            "organization_id": {
                value: 1
            },
            "account": {
                ref: "acct.account"
            },
            "username": {
                ref: "acct.user"
            },
            "cwd": {
                error: 2
            },
            executable: {
                formula: function (job) {
                    var app = getProcInfo(job);
                    if (app) {
                        return {
                            value: app.executable,
                            error: 0
                        };
                    }
                    return {
                        value: null,
                        error: this.metricErrors.codes.metricMissingUnknownReason.value
                    };
                }
            },
            application: {
                formula: function (job) {
                    var app = getProcInfo(job);
                    if (app) {
                        return {
                            value: app.name,
                            error: 0
                        };
                    }
                    return {
                        value: null,
                        error: this.metricErrors.codes.metricMissingUnknownReason.value
                    };
                }
            },
            real_application: {
                formula: function (job) {
                    var app = getProcInfo(job);
                    if (app) {
                        return {
                            value: app.realname,
                            error: 0
                        };
                    }
                    return {
                        value: null,
                        error: this.metricErrors.codes.metricMissingUnknownReason.value
                    };
                }
            },
            "exit_status": {
                formula: function(job) {
                    var exit = this.ref(job, "acct.exit_status");
                    if (exit.error === 0 && exit.value) {
                        exit.value = exit.value.split(" ")[0];
                    }
                    return exit;
                }
            },
            "datasource": {
                value: "pcp"
            },
            "granted_pe": {
                ref: "acct.ncpus"
            },
            "queue": {
                ref: "acct.partition"
            },
            "requested_nodes": {
                ref: "acct.nodes"
            },
            "hosts": {
                ref: "acct.host_list",
                required: true
            },
            "nodes": {
                ref: "acct.nodes",
                required: true
            },
            "shared": {
                formula: function(job) {
                    if (job.hasOwnProperty("shared")) {
                        return {
                            value: job.shared ? 1 : 0,
                            error: 0
                        };
                    } else {
                        return {
                            value: 0,
                            error: 0
                        };
                    }
                }
            },
            "cores": {
                ref: "acct.ncpus",
                required: true
            },
            "cores_avail": {
                formula: function(job) {
                    if (job.summarization.complete && job.hasOwnProperty("cpu") && job.cpu.hasOwnProperty("nodecpus") && ! job.cpu.nodecpus.hasOwnProperty("error")) {
                        return this.ref(job, "cpu.nodecpus.all.cnt");
                    } else {
                        return {
                            value: 0,
                            error: this.metricErrors.codes.missingCollectionFailed.value
                        };
                    }
                }
            },
            "submit_time_ts": {
                ref: "acct.submit",
                required: true
            },
            "eligible_time_ts": {
                ref: "acct.eligible"
            },
            "start_time_ts": {
                ref: "acct.start_time",
                required: true
            },
            "end_time_ts": {
                ref: "acct.end_time",
                required: true
            },
            "wall_time": {
                formula: function(job) {
                    var end_time = this.ref(job, this.attributes.end_time_ts.ref);
                    var start_time = this.ref(job, this.attributes.start_time_ts.ref);

                    var combined_error = end_time.error | start_time.error;

                    if (end_time.value === undefined || start_time.value === undefined) {
                        return {
                            value: null,
                            error: combined_error
                        };
                    }

                    return {
                        value: end_time.value - start_time.value,
                        error: combined_error
                    };
                },
                required: true
            },
            "requested_wall_time": {
                formula: function(job) {

                    var timelimit = this.ref(job, "acct.timelimit");

                    if (timelimit.error !== 0 || timelimit.value === null) {
                        return {
                            value: null,
                            error: 2
                        };
                    }

                    if (typeof timelimit.value === "number") {
                        return {
                            value: timelimit.value,
                            error: 0
                        };
                    }

                    var result = timelimit.value.match(/^(?:([0-9]+)-)?([0-9]{2}):([0-9]{2}):([0-9]{2})$/);
                    if (result) {
                        if (result[1]) {
                            return {
                                value: (24 * 3600 * result[1]) + (3600 * result[2]) + (60 * result[3]) + (1 * result[4]),
                                error: 0
                            };
                        } else {
                            return {
                                value: (3600 * result[2]) + (60 * result[3]) + (1 * result[4]),
                                error: 0
                            };
                        }
                    } else {
                        return {
                            value: null,
                            error: 2
                        };
                    }
                }
            },
            "wait_time": {
                formula: function(job) {
                    var start_time = this.ref(job, this.attributes.start_time_ts.ref);
                    var submit_time = this.ref(job, this.attributes.submit_time_ts.ref);

                    var combined_error = start_time.error | submit_time.error;

                    if (start_time.value === undefined || submit_time.value === undefined) {
                        return {
                            value: null,
                            error: combined_error
                        };
                    }

                    return {
                        value: start_time.value - submit_time.value,
                        error: combined_error
                    };
                },
                required: true
            },
            "cpu_time": {
                formula: function(job) {
                    var wall_time = this.attributes.wall_time.formula.call(this, job);
                    var num_cores = this.ref(job, this.attributes.cores.ref);

                    var combined_error = wall_time.error | num_cores.error;

                    if (wall_time.value === undefined || num_cores.value === undefined) {
                        return {
                            value: null,
                            error: combined_error
                        };
                    }

                    return {
                        value: wall_time.value * num_cores.value,
                        error: combined_error
                    };
                },
                required: true
            },
            "node_time": {
                formula: function(job) {
                    var wall_time = this.attributes.wall_time.formula.call(this, job);
                    var num_nodes = this.ref(job, this.attributes.nodes.ref);

                    var combined_error = wall_time.error | num_nodes.error;

                    if (wall_time.value === undefined || num_nodes.value === undefined) {
                        return {
                            value: null,
                            error: combined_error
                        };
                    }

                    return {
                        value: wall_time.value * num_nodes.value,
                        error: combined_error
                    };
                },
                required: true
            },
            "cpu_idle": {
                ref: ["cpu.jobcpus.idle.avg", "cpu.nodecpus.idle.avg"]
            },
            "cpu_system": {
                ref: ["cpu.jobcpus.system.avg", "cpu.nodecpus.system.avg"]
            },
            "cpu_user": {
                ref: ["cpu.jobcpus.user.avg", "cpu.nodecpus.user.avg"]
            },
            "error": {
                error: 2
            },
            "flops": {
                ref: "cpuperf.flops.avg"
            },
            "flops_cov": {
                formula: function(job) {
                    return this.getcov.call(this, job, "cpuperf.flops");
                }
            },
            "cpiref": {
                ref: "cpuperf.cpiref.avg"
            },
            "cpiref_cov": {
                formula: function(job) {
                    return this.getcov.call(this, job, "cpuperf.cpiref");
                }
            },
            catastrophe: {
                formula: function (job) {
                    var result = {
                        value: null,
                        error: this.metricErrors.codes.metricMissingNotAvailOnThisHost.value
                    };

                    if (job.catastrophe) {
                        if (job.catastrophe.error) {
                            switch (job.catastrophe.error) {
                                case 1:
                                    result.error = this.metricErrors.codes.metricDisabledByUser.value;
                                    break;
                                case 2:
                                    result.error = this.metricErrors.codes.metricInsufficientData.value;
                                    break;
                                case 6:
                                    result.error = this.metricErrors.codes.metricCounterRollover.value;
                                    break;
                                default:
                                    result.error = this.metricErrors.codes.metricMissingUnknownReason.value;
                                    break;
                            }
                        } else if (Number.isNaN(job.catastrophe.value)) {
                            result.error = this.metricErrors.codes.metricSummarizationError.value;
                        } else {
                            result.value = job.catastrophe.value;
                            result.error = 0;
                        }
                    }

                    return result;
                }
            },
            "cpldref": {
                ref: "cpuperf.cpldref.avg"
            },
            "cpldref_cov": {
                formula: function(job) {
                    return this.getcov.call(this, job, "cpuperf.cpldref");
                }
            },
            "mem_transferred": {
                ref: "uncperf.membw.avg"
            },
            "mem_transferred_cov": {
                formula: function(job) {
                    return this.getcov.call(this, job, "uncperf.membw");
                }
            },
            "cpu_user_imbalance": {
                formula: function(job) {
                    var cpu_count = this.ref(job, ["cpu.jobcpus.user.cnt", "cpu.nodecpus.user.cnt"]);
                    var cpu_user_min = this.ref(job, ["cpu.jobcpus.user.min", "cpu.nodecpus.user.min"]);
                    var cpu_user_max = this.ref(job, ["cpu.jobcpus.user.max", "cpu.nodecpus.user.max"]);
                    var error = cpu_user_min.error | cpu_user_max.error | cpu_count.error;
                    if (error === 0) {
                        if (cpu_count.value <= 1) {
                            return {
                                value: 0.0,
                                error: error
                            };
                        } else {
                            return {
                                value: 100.0 * (cpu_user_max.value - cpu_user_min.value) / cpu_user_max.value,
                                error: error
                            };
                        }
                    } else {
                        return {
                            value: null,
                            error: error
                        };
                    }
                }
            },
            "cpu_user_cv": {
                formula: function(job) {
                    return this.getcov.call(this, job, ["cpu.jobcpus.user", "cpu.nodecpus.user"]);
                }
            },
            node_cpu_idle: {
                ref: 'cpu.nodecpus.idle.avg'
            },
            energy: {
                ref: 'ipmi.energy.avg'
            },
            max_power: {
                formula: function (job) {
                    return this.getmax(job, 'ipmi.power.max');
                }
            },
            "memory_used": {
                formula: function(job) {
                    var mem = this.ref(job, "memory.used_minus_cache.avg");
                    if (mem.error === 0) {
                        return {
                            value: mem.value * 1024.0,
                            error: 0
                        };
                    }
                    return {
                        value: null,
                        error: mem.error
                    };
                }
            },
            "memory_used_cov": {
                formula: function(job) {
                    return this.getcov.call(this, job, "memory.used_minus_cache");
                }
            },
            "max_memory": {
                formula: function(job) {
                    return this.getmax(job, 'process_memory.usageratio.max');
                }
            },
            "mem_used_including_os_caches": {
                formula: function(job) {
                    var mem = this.ref(job, "memory.used.avg");
                    if (mem.error === 0) {
                        return {
                            value: mem.value * 1024.0,
                            error: 0
                        };
                    }
                    return {
                        value: null,
                        error: mem.error
                    };
                }
            },
            "mem_used_including_os_caches_cov": {
                formula: function(job) {
                    return this.getcov.call(this, job, "memory.used");
                }
            },
            "ib_rx_bytes": {
                formula: function (job) {
                    var ret_val = {
                        value: null,
                        error: this.metricErrors.codes.metricMissingUnknownReason.value
                    };
                    if (job.infiniband) {
                        if (job.infiniband.error) {
                            ret_val.error = job.infiniband.error;
                            return ret_val;
                        }

                        for (let device in job.infiniband) {
                            if (job.infiniband.hasOwnProperty(device)) {
                                if (job.infiniband[device]['switch-out-bytes'] && job.infiniband[device]['switch-out-bytes'].avg) {
                                    ret_val.value = job.infiniband[device]['switch-out-bytes'].avg;
                                    ret_val.error = 0;
                                    break;
                                }
                            }
                        }
                    }

                    return ret_val;
                }
            },

            block_sda_wr_ios: map_helpers.device('block', getHardwareConfig('block', 'sda'), 'write'),
            block_sda_wr_bytes: map_helpers.device('block', getHardwareConfig('block', 'sda'), 'write_bytes'),
            block_sda_wr_bytes_cov: map_helpers.device_cov('block', getHardwareConfig('block', 'sda'), 'write_bytes'),

            block_sda_rd_ios: map_helpers.device('block', getHardwareConfig('block', 'sda'), 'read'),
            block_sda_rd_bytes: map_helpers.device('block', getHardwareConfig('block', 'sda'), 'read_bytes'),
            block_sda_rd_bytes_cov: map_helpers.device_cov('block', getHardwareConfig('block', 'sda'), 'read_bytes'),

            netdrv_gpfs_rx: map_helpers.device('gpfs', config.hardware.gpfs, 'read_bytes'),
            netdrv_gpfs_rx_cov: map_helpers.device_cov('gpfs', config.hardware.gpfs, 'read_bytes'),
            netdrv_gpfs_rx_msgs: map_helpers.device('gpfs', config.hardware.gpfs, 'reads'),

            netdrv_gpfs_tx: map_helpers.device('gpfs', config.hardware.gpfs, 'write_bytes'),
            netdrv_gpfs_tx_cov: map_helpers.device_cov('gpfs', config.hardware.gpfs, 'write_bytes'),
            netdrv_gpfs_tx_msgs: map_helpers.device('gpfs', config.hardware.gpfs, 'writes'),

            "netdrv_isilon_rx": {
                error: 2
            },
            "netdrv_isilon_rx_cov": {
                error: 2
            },
            "netdrv_isilon_rx_msgs": {
                error: 2
            },
            "netdrv_isilon_tx": {
                error: 2
            },
            "netdrv_isilon_tx_cov": {
                error: 2
            },
            "netdrv_isilon_tx_msgs": {
                error: 2
            },
            "netdrv_panasas_rx": {
                error: 2
            },
            "netdrv_panasas_rx_cov": {
                error: 2
            },
            "netdrv_panasas_rx_msgs": {
                error: 2
            },
            "netdrv_panasas_tx": {
                error: 2
            },
            "netdrv_panasas_tx_cov": {
                error: 2
            },
            "netdrv_panasas_tx_msgs": {
                error: 2
            },

            netdir_home_read: map_helpers.sum(
                ['nfs', getHardwareConfig('mounts.home', '/home')],
                ['read-normal', 'read-server', 'read-direct']
            ),
            netdir_home_write: map_helpers.sum(
                ['nfs', getHardwareConfig('mounts.home', '/home')],
                ['write-normal', 'write-server', 'write-direct']
            ),
            netdir_projects_read: map_helpers.sum(
                ['nfs', getHardwareConfig('mounts.projects', '/projects')],
                ['read-normal', 'read-server', 'read-direct']
            ),
            netdir_projects_write: map_helpers.sum(
                ['nfs', getHardwareConfig('mounts.projects', '/projects')],
                ['write-normal', 'write-server', 'write-direct']
            ),
            netdir_util_read: map_helpers.sum(
                ['nfs', getHardwareConfig('mounts.util', '/util')],
                ['read-normal', 'read-server', 'read-direct']
            ),
            netdir_util_write: map_helpers.sum(
                ['nfs', getHardwareConfig('mounts.util', '/util')],
                ['write-normal', 'write-server', 'write-direct']
            ),

            net_eth0_rx: map_helpers.device('network', getHardwareConfig('network', 'em1'), 'in-bytes', ['lo', 'ib0', 'ib1']),
            net_eth0_rx_cov: map_helpers.device_cov('network', getHardwareConfig('network', 'em1'), 'in-bytes', ['lo', 'ib0', 'ib1']),
            net_eth0_rx_packets: map_helpers.device('network', getHardwareConfig('network', 'em1'), 'in-packets', ['lo', 'ib0', 'ib1']),

            net_eth0_tx: map_helpers.device('network', getHardwareConfig('network', 'em1'), 'out-bytes', ['lo', 'ib0', 'ib1']),
            net_eth0_tx_cov: map_helpers.device_cov('network', getHardwareConfig('network', 'em1'), 'out-bytes', ['lo', 'ib0', 'ib1']),
            net_eth0_tx_packets: map_helpers.device('network', getHardwareConfig('network', 'em1'), 'out-packets', ['lo', 'ib0', 'ib1']),

            "net_ib0_rx": {
                ref: "network.ib0.in-bytes.avg"
            },
            "net_ib0_rx_packets": {
                ref: "network.ib0.in-packets.avg"
            },
            "net_ib0_tx": {
                ref: "network.ib0.out-bytes.avg"
            },
            "net_ib0_tx_packets": {
                ref: "network.ib0.out-packets.avg"
            },
            gpus: {
                ref: 'acct.gpus'
            },
            gpu_time: {
                formula: function (job) {
                    var wall_time = this.attributes.wall_time.formula.call(this, job);
                    var num_gpus = this.ref(job, this.attributes.gpus.ref);

                    var combined_error = wall_time.error | num_gpus.error;

                    if (wall_time.value === undefined || num_gpus.value === undefined) {
                        return {
                            value: null,
                            error: combined_error
                        };
                    }

                    return {
                        value: wall_time.value * num_gpus.value,
                        error: combined_error
                    };
                }
            },
            gpu_usage: {
                formula: function (job) {
                    if (!job.hasOwnProperty('gpu')) {
                        return {
                            value: null,
                            error: this.metricErrors.codes.metricMissingUnknownReason.value
                        };
                    }

                    var count = 0.0;
                    var avg = 0.0;
                    var error = 0;

                    for (var gpu in job.gpu) {
                        if (job.gpu.hasOwnProperty(gpu) &&
                            job.gpu[gpu].hasOwnProperty('gpuactive') &&
                            job.gpu[gpu].gpuactive.hasOwnProperty('avg')) {
                            count += 1.0;
                            avg += job.gpu[gpu].gpuactive.avg;
                        } else {
                            error = this.metricErrors.codes.metricMissingUnknownReason.value;
                        }
                    }

                    if (error === 0) {
                        return {
                            value: (avg / 100.0) / count,
                            error: 0
                        };
                    }
                    return {
                        value: null,
                        error: error
                    };
                }
            },
            gpu_energy: {
                formula: function (job) {
                    if (!job.gpupower) {
                        return { value: null, error: this.metricErrors.codes.metricMissingNotAvailOnThisHost.value };
                    }

                    var energy = 0.0;
                    var device_count = 0;

                    for (let gpu in job.gpupower) {
                        if (job.gpupower.hasOwnProperty(gpu)) {
                            if (job.gpupower[gpu].energy && job.gpupower[gpu].energy.avg) {
                                energy += job.gpupower[gpu].energy.avg;
                                device_count += 1;
                            }
                        }
                    }

                    if (device_count === 0) {
                        return { value: null, error: this.metricErrors.codes.missingCollectionFailed.value };
                    }

                    return { value: energy, error: 0 };
                }
            },
            gpu_max_power: {
                formula: function (job) {
                    if (!job.gpupower) {
                        return { value: null, error: this.metricErrors.codes.metricMissingNotAvailOnThisHost.value };
                    }

                    var max_power = 0.0;
                    var device_count = 0;

                    for (let gpu in job.gpupower) {
                        if (job.gpupower.hasOwnProperty(gpu)) {
                            if (job.gpupower[gpu].power && job.gpupower[gpu].power.max) {
                                if (job.gpupower[gpu].power.max.max) {
                                    max_power = Math.max(max_power, job.gpupower[gpu].power.max.max);
                                    device_count += 1;
                                } else if (job.gpupower[gpu].power.max.avg) {
                                    max_power = Math.max(max_power, job.gpupower[gpu].power.max.avg);
                                    device_count += 1;
                                }
                            }
                        }
                    }

                    if (device_count === 0) {
                        return { value: null, error: this.metricErrors.codes.missingCollectionFailed.value };
                    }

                    return { value: max_power, error: 0 };
                }
            },
            "gpu0_nv_mem_used": {
                ref: "gpu.gpu0.memused.avg"
            },
            "gpu0_nv_utilization": {
                formula: function(job) {
                    var gpu = this.ref(job, "gpu.gpu0.gpuactive.avg");
                    if (gpu.error === 0) {
                        return {
                            value: gpu.value / 100.0,
                            error: 0
                        };
                    } else {
                        return {
                            value: null,
                            error: gpu.error
                        };
                    }
                }
            }
        }
    };
};
