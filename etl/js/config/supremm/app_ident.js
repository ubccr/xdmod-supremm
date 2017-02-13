"use strict";

module.exports = function(configfile) {

    var fs = require("fs");
    var appconf = JSON.parse(fs.readFileSync(configfile, 'utf8'));

    var i;
    for (i = 0; i < appconf.length; i++) {
        appconf[i].realname = appconf[i].name;
        if (appconf[i].license_type != "permissive") {
            appconf[i].name = "PROPRIETARY";
        }
    }

    var pathregex = [];
    var execregex = [];
    var simplematches = [];

    var init = function() {

        var pathmatch = [];
        var pathappid = [];
        var legacyexact = [];
        var legacyappid = [];
        var execmatch = [];
        var execappid = [];

        var i, j;
        for (i = 0; i < appconf.length; i++) {
            if (appconf[i].name == 'NA' || appconf[i].name == 'uncategorized') {
                continue;
            }

            if (appconf[i].pathmatch) {
                pathmatch.push('(' + appconf[i].pathmatch.join('\|') + ')');
                pathappid.push(i);
            }

            if (appconf[i].execmatch) {
                execmatch.push('(' + appconf[i].execmatch.join('\|') + ')');
                execappid.push(i);
            }

            if (appconf[i].hints) {
                var exact = [];
                for (j = 0; j < appconf[i].hints.length; j++) {
                    exact.push('^' + appconf[i].hints[j] + '$');
                    simplematches.push({pattern: appconf[i].hints[j].toLocaleLowerCase(), appid: i});
                }
                if (exact.length > 0) {
                    legacyexact.push('(' + exact.join('\|') + ')');
                    legacyappid.push(i);
                }
            }
        }

        if (pathmatch.length > 0) {
            pathregex.push({regex: new RegExp(pathmatch.join('\|'), 'i'), appid: pathappid});
        }

        if (execmatch.length > 0) {
            execregex.push({regex: new RegExp(execmatch.join('\|'), 'i'), appid: execappid});
        }

        if (legacyexact.length > 0) {
            execregex.push({regex: new RegExp(legacyexact.join('\|'), 'i'), appid: legacyappid});
        }
    };

    var getmatch = function(regex, cmdline) {
        var appindex = null;

        var match = regex.exec(cmdline);
        if (match) {
            match.some(function(value, index) {
                if (index > 0 && value) {
                    appindex = index - 1;
                    return true;
                }
                return false;
            });
        }

        return appindex;
    };

    init();

    return function(cmdline) {
        var i, index, execstr, cmdtoks;

        cmdtoks = cmdline.split('/');
        execstr = cmdtoks[cmdtoks.length - 1];

        for (i = 0; i < pathregex.length; i++) {
            index = getmatch(pathregex[i].regex, cmdline);
            if (index !== null) {
                return appconf[pathregex[i].appid[index]];
            }
        }

        for (i = 0; i < execregex.length; i++) {
            index = getmatch(execregex[i].regex, execstr);
            if (index !== null) {
                return appconf[execregex[i].appid[index]];
            }
        }
        var lowercmd = execstr.toLocaleLowerCase();
        for (i = 0; i < simplematches.length; i++) {
            if (lowercmd.indexOf(simplematches[i].pattern) !== -1) {
                return appconf[simplematches[i].appid];
            }
        }
        return null;
     };
};

