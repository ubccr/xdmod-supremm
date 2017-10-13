var logIn = require('../../../../../xdmod/open_xdmod/modules/xdmod/automated_tests/test/specs/xdmod/loginPage.page.js');

var fs = require('fs');
var jV = require('./jobViewer.page.js');
var me = require('../../../../../xdmod/open_xdmod/modules/xdmod/automated_tests/test/specs/xdmod/metricExplorer.page.js');
var xdmod = require('../../../../../xdmod/open_xdmod/modules/xdmod/automated_tests/test/specs/xdmod/xdmod.page.js');


describe('Job Viewer', function jobViewer() {
    logIn.login('centerdirector');
    var selectors = jV.selectors;
    var meselectors = testHelpers.metricExplorer;

    describe('Select Tab', function login() {
        it('Selected', function jvSelect() {
            browser.waitForLoadedThenClick(selectors.tab, 50000);
            browser.waitForVisible(selectors.container, 20000);
        });

        it('Has Instructions', function jvConfirmInstructions() {
            var instructions = 'No job is selected for viewing\n\nPlease refer to the instructions below:\n\n\n\nFor more information, please refer to the User Manual';
            browser.waitForExist(selectors.container + '  .x-grid-empty img[src="gui/images/job_viewer_instructions.png"]');
            expect(browser.getText(selectors.container + ' .x-grid-empty')).to.equal(instructions);
        });
    });

    describe('Quick Lookup', function () {
        describe('No results', function () {
            it('Click the search button', function jvClickBeginSearch() {
                browser.waitAndClick(selectors.search.button);
            });
            it('Perform a basic search', function jvPerformSearch() {
                jV.performSearch(128, '', 'robertson', false);
            });
            it('Have no results', function jvNoResults() {
                browser.waitForVisible('#search_results .x-mask');
                browser.getText('#search_results .x-mask');
                expect(browser.getText('#search_results .x-mask')).to.equal('Lookup returned zero jobs.');
                expect(browser.isExisting('#job-viewer-search-save-results .x-item-disabled')).to.equal(false);
            });
            it('Cancel search', function jvCancleSearch() {
                browser.click('#job-viewer-search-cancel');
                browser.waitForInvisible(selectors.search.window);
            });
        });

        describe('With results', function () {
            var saveSearchName = 'AUTOTEST ' + new Date();
            it('Click the search button', function jvClickBeginSearch() {
                browser.waitAndClick(selectors.search.button);
            });
            it('Perform a basic search', function jvPerformSearch() {
                jV.performSearch(6118004, saveSearchName, 'robertson', true);
            });
            it('View saved job then delete it.', function () {
                var jobIdent = 'robertson-6118004';
                jV.viewSaveJob(jobIdent, saveSearchName);
                browser.waitUntilAnimEndAndClick(selectors.history.tree.searchnode(saveSearchName), 'right');
                jV.performDelete(jobIdent);
                me.clickLogoAndWaitForMask();
            });
        });
    });

    describe('Advanced Search', function () {
        var saveSearchName = 'AUTOTEST ' + new Date();
        var jobs = [
            {
                id: 2274437,
                ident: 'frearson-2274437'
            },
            {
                id: 6095918,
                ident: 'robertson-6095918'
            }
        ];
        describe('Simple single filter lookup', function () {
            it('Click the search button', function jvClickBeginSearch() {
                browser.waitAndClick(selectors.search.button);
            });
            it('Add filters; Run Search', function () {
                jV.addFiltersRunSearch(saveSearchName);
            });
            it('Select Search Results', function () {
                browser.waitAndClick(selectors.search.results.byJobId(jobs[0].id));
                browser.waitAndClick(selectors.search.results.byJobId(jobs[1].id));
                jV.saveSearch();
                me.clickLogoAndWaitForMask();
            });
            it('View saved jobs using tree navigation.', function () {
                jV.viewSavedJobsTreeNav(saveSearchName, jobs);
            });
            it('Delete saved search.', function () {
                browser.waitUntilAnimEndAndClick(selectors.history.tree.searchnode(saveSearchName), 'right');
                jV.performDelete(jobs[0].ident);
                me.clickLogoAndWaitForMask();
            });
        });
    });


    describe('Tree Sort Order', function () {
        var jobIdent = 'robertson-6117006';
        var saveSearchName = 'AUTOTEST ' + new Date();

        it('Click the search button', function jvClickBeginSearch() {
            browser.waitAndClick(selectors.search.button);
        });
        it('Perform a basic search', function jvPerformSearch() {
            jV.performSearch(6117006, saveSearchName, 'robertson', true);
        });
        it('View saved job.', function () {
            jV.viewSaveJob(jobIdent, saveSearchName);
        });
        it('Change sort order', function () {
            jV.changeSortOrder(saveSearchName, jobIdent);
        });
        it('View saved job.', function () {
            jV.viewSaveJob(jobIdent, saveSearchName);
        });
    });


    describe('Job Tab Clicks', function () {
        var job = {
            id: 6113332,
            resource: 'robertson',
            ident: 'robertson-6113332'
        };
        var saveSearchName = 'AUTOTEST ' + new Date();

        it('Click the search button', function jvClickBeginSearch() {
            browser.waitAndClick(selectors.search.button);
        });
        it('Perform a basic search', function jvPerformSearch() {
            jV.performSearch(job.id, saveSearchName, job.resource, true);
        });

        it('View saved job timeseries.', function () {
            jV.viewSavedJobTimeseries(saveSearchName, job.ident, 'CPU User', 'Timeseries', 'cpn-k13-23-02', 'tsid_cpuuser');
        });
    });


    describe('Edit Search', function editSearch() {
        var resource = 'robertson';
        var startDate = '2016-12-22';
        var endDate = '2017-01-01';
        var criteriaName = 'Application';
        var criteriaValue = 'enzo';
        var jobId = 6117153;
        var nextJobId = 6118004;
        var searchNameBasic = 'AUTOTEST-QUICK' + new Date();

        describe("Testing 'edit search' on a Quick Lookup Search ", function createSearch() {
            describe('Create a Quick Lookup Search', function createQuickLookupSearch() {
                it('Click the search button', function jvClickBeginSearch() {
                    browser.waitAndClick(selectors.search.button);
                }); // Click the search button

                it('Perform a Quick Lookup', function performQuickLookup() {
                    jV.performSearch(jobId, searchNameBasic, resource, true);
                }); // Perform a basic search
            }); // Create a Basic Search

            describe("Perform 'Edit' action on newly created Quick Lookup", function performEditAction() {
                it("Perform 'Edit Search' Action", function performEditSearchAction() {
                    jV.performEditSearch(searchNameBasic);
                }); // Perform 'Edit Search' Action

                it('Validate that the search parameters have been set correctly.', function validateParametersSet() {
                    expect(browser.getValue(selectors.search.basic.resource)).to.equal(resource);
                    expect(browser.getValue(selectors.search.basic.jobId)).to.equal(String(jobId));
                }); // Validate that the search parameters have been set correctly.

                it('Change the Job Number', function changeJobNumber() {
                    jV.changeJobNumber(nextJobId);
                }); // Change the Job Number

                it("Perform 'Edit Search' Action Again", function performEditSearchActionAgain() {
                    browser.waitUntilAnimEndAndClick(selectors.history.tree.searchnode(searchNameBasic), 'right');
                    browser.waitForVisible(selectors.history.search.contextMenu.container, 30000);
                    browser.waitAndClick(selectors.history.search.contextMenu.buttons.editSearch);
                }); // Perform 'Edit Search' Action

                it('Validate that the search parameters have been set correctly.', function validateParametersSet() {
                    jV.validateSearchParameters(resource, nextJobId);
                }); // Validate that the search parameters have been set correctly.
            }); // Perform 'Edit Search' action on newly created Basic Search.

            describe('Delete Basic search', function deleteSearch() {
                it('Perform Delete', function performDelete() {
                    browser.waitUntilAnimEndAndClick(selectors.history.tree.searchnode(searchNameBasic), 'right');
                    jV.performDelete(searchNameBasic);
                    me.clickLogoAndWaitForMask();
                }); // Perform Delete
            }); // Delete Basic Search
        }); // Testing 'edit search' on a Basic Search

        describe("Testing 'edit search' on an Advanced Search", function editAdvancedSearch() {
            var searchNameAdvanced = 'AUTOTEST-ADV' + new Date();

            describe('Create Advanced Search', function createAdvancedSearch() {
                it('Click the search button', function jvClickBeginSearch() {
                    browser.waitAndClick(selectors.search.button);
                }); // Click the search button

                it('Fill in Advanced Search Parameters', function () {
                    jV.fillInAdvancedSearch(startDate, endDate, searchNameAdvanced, criteriaName, criteriaValue);
                }); // Fill in Advanced Search Parameters

                it('Save Advanced Search Parameters', function saveAdvancedSearch() {
                    jV.saveSearch();
                    me.clickLogoAndWaitForMask();
                }); // Save Advanced Search Parameters
            }); // Create Advanced Search


            describe('Edit the newly created Advanced Search', function () {
                it("Perform the 'Edit Search' action", function performEditSearch() {
                    jV.performEditSearch(searchNameAdvanced);
                }); // Perform the 'Edit Search' action
                it('Validate that the search criteria was set correctly', function validateCriteriaSet() {
                    browser.waitForVisible('//div[@id="job-viewer-search-criteria-grid"]//div[contains(text(),"Application")]');
                    browser.waitForVisible('//div[@id="job-viewer-search-criteria-grid"]//div[contains(text(),"enzo")]');
                    jV.validateSearchDates(startDate, endDate);
                });
                it('Validate that we have the correct number of results set', function validateResults() {
                    browser.click('#job-viewer-search-search button');
                    browser.waitForVisible('#job-viewer-search-panel .ext-el-mask', 50000, true);
                    expect(browser.elements(selectors.search.results.all).value.length).to.equal(5);
                });

                it('Change the selected records', function changeSelectedRecords() {
                    jV.changeSelectedRecords();
                });
            }); // Edit the newly created Advanced Search

            describe('Delete the Advanced Search', function deleteAdvancedSearch() {
                it('Perform Delete Action', function performDelete() {
                    browser.waitUntilAnimEndAndClick(selectors.history.tree.searchnode(searchNameAdvanced), 'right', 30000);
                    jV.performDelete(searchNameAdvanced);
                    me.clickLogoAndWaitForMask();
                });
            });
        }); // Create an Advanced Search

        describe('Edit a Metric Explorer Search', function editMetricExplorerSearch() {
            var tabId;
            var chartTitle = 'Job Viewer ' + new Date();
            it('Click the Metric Explorer Tab', function selectMetricExplorerTab() {
                xdmod.selectTab('metric_explorer');
                me.waitForLoaded();
            }); // Click the Metric Explorer Tab
            it('Create a metric explorer chart with SUPReMM data', function openSUPREMMMetrics() {
                me.createNewChart(chartTitle, 'Timeseries', 'Line');
                me.setDateRange('2016-12-30', '2017-01-01');
                me.addDataViaCatalog('SUPREMM', 'CPU Hours: Total', 'Resource');
                browser.waitUntilChartLoadsBySeries('CPU Hours: Total');
            });
            it('Click the first data point for the first data series', function clickFirstSeries() {
                me.clickFirstDataPoint();
            });
            it("Open 'Show Raw Data' Window", function showRawData() {
                browser.waitForVisible(meselectors.contextMenuItemByText('Show raw data'), 30000);
                browser.click(meselectors.contextMenuItemByText('Show raw data'));
            });
            it("Select an entry in the 'Show Raw Data' window", function selectRawDataEntry() {
                tabId = jV.selectEntryRawDataWindow();
            });
            it('verify that we have the correct job open', function verifyCorrectJobIsOpen() {
                browser.waitForVisible(selectors.info.tabByName(tabId), 30000);
            });
            it("Verify that the 'Edit Search' action is disabled", function performEditSearchActionAgain() {
                jV.verifyEditSearchIsDisabled(chartTitle);
            }); // Perform 'Edit Search' Action

            describe('Delete the Metric Explorer Search', function deleteMetricExplorerSearch() {
                it('Perform Delete Action', function performDelete() {
                    jV.performDelete(chartTitle);
                    me.clickLogoAndWaitForMask();
                });
            });
        }); // Edit a Metric Explorer Search
    }); // Edit Search

    describe('Delete all Searches', function () {
        it('Delete all search', function () {
            jV.deleteAllSearches();
        });
    });

    describe('Save coverage report', function () {
        it('Get the report and save', function () {
            fs.writeFileSync('coverage.json', browser.execute('return JSON.stringify(window.__coverage__, null, 4);').value);
        });
    });
    logIn.logout();
});
