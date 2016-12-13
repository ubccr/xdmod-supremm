"use strict";

var logger = { warning: function(s) { console.log(s) } };


module.exports = function(configfile) {

    var fs = require("fs");
    var mysql = require("mysql");

    var appconf = JSON.parse(fs.readFileSync(configfile));

    var appconfobj = {};
    var maxid = 0;
    for(var i = 0; i < appconf.length; i++) {
        if( appconfobj[ appconf[i].name ] ) {
            logger.warning("Duplicate application definitions for " + appconf[i].name + " only the final definition will be used.");
        }
        appconfobj[ appconf[i].name ] = appconf[i];
        maxid = Math.max(maxid, appconf[i].id);
    }

    if( appconfobj['PROPRIETARY'] ) {
        var proprietary_id = appconfobj['PROPRIETARY'].id;
    } else {
        logger.warning("Adding an application definition for PROPRIETARY");
        maxid += 1;
        var proprietary_id = maxid;
        appconf.push({ id: proprietary_id, name: 'PROPRIETARY', license_type: 'permissive', hints: []});
    }

    return {
        getsql: function() {

            var application_table = "`modw_supremm`.`application`";
            var applicationhint_table = "`modw_supremm`.`application_hint`";

            var approws = [];
            var hintrows = [];

            for(var i = 0; i < appconf.length; i++) {
                approws.push("(" + appconf[i].id + "," + mysql.escape(appconf[i].name) + "," + mysql.escape(appconf[i].license_type) + ")");
                var appid = (appconf[i].license_type == "permissive") ? appconf[i].id : proprietary_id;
                for(var j=0; j < appconf[i].hints.length; j++) {
                    hintrows.push("(" + appid + "," + mysql.escape(appconf[i].hints[j]) + "," + appconf[i].id + ")");
                }
            }

            var apptablesql =  [
                "LOCK TABLES " + applicationhint_table + " WRITE, " + application_table + " WRITE",
                "DELETE IGNORE FROM " + applicationhint_table,
                "DELETE IGNORE FROM " + application_table,
                "INSERT INTO " + application_table + " (id, name, license_type) VALUES " + approws.join(","),
                "INSERT INTO " + applicationhint_table + " (id, hint, realid) VALUES " + hintrows.join(","),
                "UNLOCK TABLES"

            ];
            return apptablesql.join(";\n");
        }
    }
};

/* Used for testing */
if( require.main === module ) {
    console.log(module.exports("./application.json").getsql());
}

