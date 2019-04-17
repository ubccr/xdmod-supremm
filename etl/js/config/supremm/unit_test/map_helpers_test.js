/* eslint-env es6 */

var map_helpers = require('../map_helpers.js');

var job = {
    net: {
        eth0: {
            read: {
                avg: 1234.0
            }
        },
        en1: {
            read: {
                avg: 5678.0
            }
        },
        lo: {
            read: {
                avg: 9101.0
            }
        }
    }
};

var devices = ['eth0', ['none', 'en1', 'eth0'], 'all', 'none', undefined];
var expected = [1234.0, 5678.0, 1234.0 + 5678.0 + 9101.0, null, null];

for (let i = 0; i < devices.length; i++) {
    let fn1 = map_helpers.device('net', devices[i], 'read').formula;
    if (fn1(job).value !== expected[i]) {
        console.log('Error', devices[i], fn1(job), expected[i]);
        process.exit(-1);
    }
}
