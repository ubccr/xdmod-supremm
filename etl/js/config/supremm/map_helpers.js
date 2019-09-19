'use strict';

const ERR_MISSING = 2;
const ERR_UNK = 8;

var getDeviceCovMetric = function (job, plugin, device, metric) {
    var result = {
        value: null,
        error: ERR_UNK
    };

    var stats = null;

    if (job.hasOwnProperty(plugin)) {
        if (device === 'all') {
            let dev_count = 0;
            for (let dev in job[plugin]) {
                if (job[plugin].hasOwnProperty(dev)) {
                    dev_count += 1;
                    stats = job[plugin][dev];
                }
            }
            if (dev_count !== 1) {
                return {
                    value: null,
                    error: ERR_MISSING
                };
            }
        } else if (Array.isArray(device)) {
            for (let i = 0; i < device.length; i++) {
                if (job[plugin].hasOwnProperty(device[i])) {
                    stats = job[plugin][device[i]];
                    break;
                }
            }
        } else if (job[plugin].hasOwnProperty(device)) {
            stats = job[plugin][device];
        }
    }

    if (stats && stats.hasOwnProperty(metric)) {
        if (stats[metric].hasOwnProperty('cov')) {
            result.value = stats[metric].cov;
            result.error = 0;
        } else if (stats[metric].hasOwnProperty('avg')) {
            result.value = 0.0;
            result.error = 0;
        }
    }

    return result;
};

var getDeviceMetric = function (job, plugin, device, metric, exclude) {
    var result = {
        value: null,
        error: ERR_UNK
    };

    if (job.hasOwnProperty(plugin)) {
        if (device === 'all') {
            // Special case -> sum all devices
            result.value = 0;
            let dev_count = 0;
            for (let dev in job[plugin]) {
                if (job[plugin].hasOwnProperty(dev)) {
                    if (exclude && exclude.indexOf(dev) !== -1) {
                        continue;
                    }
                    if (job[plugin][dev].hasOwnProperty(metric) && job[plugin][dev][metric].hasOwnProperty('avg')) {
                        result.value += job[plugin][dev][metric].avg;
                        dev_count += 1;
                    }
                }
            }
            if (dev_count > 0) {
                result.error = 0;
            } else {
                result.value = null;
            }
        } else if (Array.isArray(device)) {
            for (let i = 0; i < device.length; i++) {
                if (job[plugin].hasOwnProperty(device[i]) &&
                    job[plugin][device[i]].hasOwnProperty(metric) &&
                    job[plugin][device[i]][metric].hasOwnProperty('avg')) {
                    result.value = job[plugin][device[i]][metric].avg;
                    result.error = 0;
                    break;
                }
            }
        } else if (job[plugin].hasOwnProperty(device) &&
            job[plugin][device].hasOwnProperty(metric) &&
            job[plugin][device][metric].hasOwnProperty('avg')) {
            result.value = job[plugin][device][metric].avg;
            result.error = 0;
        }
    } else {
        result.error = ERR_MISSING;
    }

    return result;
};

var sumMetrics = function (job, path, metrics) {
    var result = {
        value: null,
        error: ERR_MISSING
    };

    var data = job;
    for (let i = 0; i < path.length; i++) {
        if (typeof data === 'object' && data.hasOwnProperty(path[i])) {
            data = data[path[i]];
        } else {
            data = null;
            break;
        }
    }

    if (data === null) {
        return result;
    }

    result.value = 0;
    result.error = 0;

    for (let i = 0; i < metrics.length; i++) {
        if (data.hasOwnProperty(metrics[i]) && data[metrics[i]].hasOwnProperty('avg')) {
            result.value += data[metrics[i]].avg;
        } else {
            result.value = null;
            result.error = ERR_UNK;
            break;
        }
    }

    return result;
};

module.exports = {
    sum: function (path, metrics) {
        return {
            formula: function (job) {
                return sumMetrics(job, path, metrics);
            }
        };
    },
    device: function (plugin, device, metric, exclude) {
        return {
            formula: function (job) {
                return getDeviceMetric(job, plugin, device, metric, exclude);
            }
        };
    },

    device_cov: function (plugin, device, metric) {
        return {
            formula: function (job) {
                return getDeviceCovMetric(job, plugin, device, metric);
            }
        };
    }
};
