/*node.js javascript document
 *
 * @authors: Amin Ghadersohi
 * @date: 2/6/2014
 *
 * @requirements:
 *	node.js
 *
 */

//the version of this profile. Increment to force re-etl
var version = 139;

var configRoot = String(__dirname), //the folder where schema, dataset_maps, and tests directories reside.
    fs = require("fs"),
    util = require("util");

var datasetRoot = configRoot + "/dataset_maps";

var getJobsToProcessMongoQuery = function(databasekey) {
    var query = {};
    query["processed." + databasekey + ".version"] = {
        $ne: version
    };
    return query;
};

var markAsProcessedMongoUpdate = function(collection, _id, config, endFn, dbkey) {
    var setter = {};
    setter["processed." + dbkey] = {
        ts: new Date().getTime(), //milliseconds since epoch (not unix timestamp since that would be in seconds)
        version: version
    };
    util._extend(setter["processed." + dbkey], config);
    collection.update({
        _id: _id
    }, {
        $set: setter
    }, {
        w: 0
    }, function(err /*, result */ ) {
        endFn(err);
    });
};

var getMongoSettings = function(config, datasetConfig) {

    var section = "jobsummarydb";
    if (datasetConfig.db) {
        section = datasetConfig.db;
    }

    var dbsettings = config.xdmodConfig[section];

    if (!dbsettings) {
        throw new Error("MongoDB configuration section \"" + section + "\" missing from XDMoD portal_settings.");
    }

    // Backwards compatibility with host/port specification
    if (!dbsettings.uri && dbsettings.host && dbsettings.port && dbsettings.db) {
        dbsettings.uri = "mongodb://" + dbsettings.host + ":" + dbsettings.port + "/" + dbsettings.db;
    }

    if (!(dbsettings.uri && dbsettings.db_engine)) {
        throw new Error("Missing MongoDB configuration settings in section \"" + section + "\" of the XDMoD portal_settings.");
    }

    return dbsettings;
};

module.exports = {
    name: "SUPREMM ETL",
    description: "ETL Configuration for SUPREMM Data",
    version: version,
    root: configRoot,
    schema: null,
    schemaValidator: JSON.parse(fs.readFileSync(configRoot + "/validators/etl.schema.schema.json", "utf8")),
    mappingValidator: JSON.parse(fs.readFileSync(configRoot + "/validators/dataset.schema.json", "utf8")),
    init: function() {
        // Load XDMoD portal settings configuration
        var config = require("../../config.js");

        // Load schema file.
        this.schema = require(configRoot + "/" + config.xdmodConfig["supremm-general"].schema_file);

        // Load database settings for datawarehouse
        var dwconf = config.xdmodConfig.datawarehouse;
        this.output = {
            dbEngine: dwconf.db_engine.toLowerCase(),
            config: {
                database: "modw_supremm",
                host: dwconf.host,
                port: dwconf.port,
                user: dwconf.user,
                password: dwconf.pass
            }
        };

        var supremmResource = config.getXdmodConfigFile("supremm_resources");
        var datasetConfig = supremmResource.resources;

        this.datasets = [];

        var i, db;
        for (i = 0; i < datasetConfig.length; i += 1) {

            db = getMongoSettings(config, datasetConfig[i]);

            this.datasets.push({
                name: datasetConfig[i].resource,
                enabled: datasetConfig[i].enabled === undefined ? true : datasetConfig[i].enabled,
                mapping: this.getDatasetMap(datasetConfig[i].datasetmap, datasetConfig[i]),
                input: {
                    dbEngine: db.db_engine.toLowerCase(),
                    config: util._extend({
                        collection: datasetConfig[i].collection
                    }, db),
                    sortQuery: {},
                    getQuery: function() {
                        return getJobsToProcessMongoQuery(this.databasekey);
                    },
                    markAsProcessed: function(collection, _id, config, endFn) {
                        markAsProcessedMongoUpdate(collection, _id, config, endFn, this.databasekey);
                    }
                },
                regressionTestDir: configRoot + "/tests/" + datasetConfig[i].resource
            });
        }
    },
    setup: function(afterSetup) {

        var etl_uid = require("../../lib/etl_uid.js");
        var datasets = this.datasets;

        var uidgen = new etl_uid(this.output);

        uidgen.getProfileUuid(function(err, uuid) {
            if (err) {
                afterSetup(err);
                return;
            }

            // Update all dataset config with the key so they can generate the correct query
            datasets.forEach(function(dataset) {
                dataset.input.databasekey = uuid;
            });

            afterSetup(err);
        });
    },
    getDatasetMap: function(mapName, config) {
        var dmap = require(datasetRoot + "/" + mapName + ".js");
        return new dmap(config);
    }
};
