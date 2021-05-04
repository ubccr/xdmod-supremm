var logIn = require('../../../../../xdmod/tests/ui/test/specs/xdmod/loginPage.page.js');
var eff = require('./efficiency.page.js');

describe('Efficiency', function efficiency() {
    logIn.login('centerdirector');
    var selectors = eff.selectors;

    describe('Select Tab', function login() {
        it('Selected', function jvSelect() {
            browser.waitForLoadedThenClick(selectors.tab, 50000);
            browser.waitForVisible(selectors.container, 20000);
        });
    });

    logIn.logout();
});
