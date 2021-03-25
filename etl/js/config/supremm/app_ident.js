'use strict';

var fs = require('fs');

module.exports = function (configfile) {
    var appconf = JSON.parse(fs.readFileSync(configfile, 'utf8'));

    for (let i = 0; i < appconf.length; i++) {
        appconf[i].realname = appconf[i].name;
        if (appconf[i].license_type !== 'permissive') {
            appconf[i].name = 'PROPRIETARY';
        }
    }

    var pathregex = [];
    var execregex = [];
    var simplematches = [];

    var init = function () {
        var pathmatch = [];
        var pathappid = [];
        var legacyexact = [];
        var legacyappid = [];
        var execmatch = [];
        var execappid = [];

        for (let i = 0; i < appconf.length; i++) {
            if (appconf[i].name === 'NA' || appconf[i].name === 'uncategorized') {
                continue;
            }

            if (appconf[i].pathmatch) {
                pathmatch.push('(' + appconf[i].pathmatch.join('|') + ')');
                pathappid.push(i);
            }

            if (appconf[i].execmatch) {
                execmatch.push('(' + appconf[i].execmatch.join('|') + ')');
                execappid.push(i);
            }

            if (appconf[i].hints) {
                var exact = [];
                for (let j = 0; j < appconf[i].hints.length; j++) {
                    exact.push('^' + appconf[i].hints[j] + '$');
                    simplematches.push({ pattern: appconf[i].hints[j].toLocaleLowerCase(), appid: i });
                }
                if (exact.length > 0) {
                    legacyexact.push('(' + exact.join('|') + ')');
                    legacyappid.push(i);
                }
            }
        }

        if (pathmatch.length > 0) {
            pathregex.push({ regex: new RegExp(pathmatch.join('|'), 'i'), appid: pathappid });
        }

        if (execmatch.length > 0) {
            execregex.push({ regex: new RegExp(execmatch.join('|'), 'i'), appid: execappid });
        }

        if (legacyexact.length > 0) {
            execregex.push({ regex: new RegExp(legacyexact.join('|'), 'i'), appid: legacyappid });
        }
    };

    var getmatch = function (regex, cmdline) {
        var appindex = null;

        var match = regex.exec(cmdline);
        if (match) {
            match.some(function (value, index) {
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

    var appmatch = function (cmdline) {
        var index;
        var cmdtoks = cmdline.split('/');
        var execstr = cmdtoks[cmdtoks.length - 1];

        for (let i = 0; i < pathregex.length; i++) {
            index = getmatch(pathregex[i].regex, cmdline);
            if (index !== null) {
                return appconf[pathregex[i].appid[index]];
            }
        }

        for (let i = 0; i < execregex.length; i++) {
            index = getmatch(execregex[i].regex, execstr);
            if (index !== null) {
                return appconf[execregex[i].appid[index]];
            }
        }
        var lowercmd = execstr.toLocaleLowerCase();
        for (let i = 0; i < simplematches.length; i++) {
            if (lowercmd.indexOf(simplematches[i].pattern) !== -1) {
                return appconf[simplematches[i].appid];
            }
        }
        return null;
    };

    var getcommand = function (cmdline) {
        var cmdend = cmdline.indexOf(' ');
        if (cmdend === -1) {
            cmdend = cmdline.length;
        }
        var cmdbegin = cmdline.lastIndexOf('/', cmdend) + 1;

        return cmdline.substring(cmdbegin, cmdend);
    };
    var commandparsers = {
        java: function (cmdline) {
            // Crude command parser, does not take into account escape characters
            var tokens = cmdline.split(' ');
            for (var i = 0; i < tokens.length - 1; i++) {
                if (tokens[i] === '-jar') {
                    return tokens[i + 1];
                }
            }
            return tokens[0];
        }
    };

    return function (procarray) {
        var blacklist = [
            'sh',
            'csh',
            'bash',
            'sleep',
            'srun',
            'mpiexec',
            'mpirun.mpich',
            'ssh',
            'scontrol',
            'slurm_script',
            'slurmstepd:',
            'mpiexec.hydra',
            'mpirun',
            'pmi_proxy',
            'numactl',
            'cp',
            'polkitd',
            '_batch_command.'
        ];

        var len = procarray.length;

        var executables = [];

        for (let i = 0; i < len; i += 1) {
            var cmd = getcommand(procarray[i]);
            if (blacklist.indexOf(cmd) === -1) {
                if (commandparsers[cmd]) {
                    executables.push(commandparsers[cmd](procarray[i]));
                } else {
                    executables.push(procarray[i].split(' ')[0]);
                }
            }
        }

        var low_priority = [];

        for (let i = 0; i < executables.length; i++) {
            let result = appmatch(executables[i]);
            if (result) {
                result.executable = executables[i];
                if (result.priority && result.priority < 0) {
                    low_priority.push(result);
                } else {
                    return result;
                }
            }
        }
        if (low_priority.length > 0) {
            return low_priority[0];
        }
        return null;
    };
};

