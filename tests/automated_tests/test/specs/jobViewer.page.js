class JobViewer {
    constructor() {
        this.meselectors = testHelpers.metricExplorer;
        this.selectors = {
            tab: '#main_tab_panel__job_viewer',
            container: '#job_viewer',
            search: {
                button: '#job_viewer button.x-btn-text.search',
                window: '#search-window',
                basic: {
                    resource: '#basic-resource',
                    jobId: '#basic-localjobid',
                    jobIdLabel: 'label[for=basic-localjobid]',
                    resource_dropdown: '//input[@id="basic-resource"]/../img[contains(@class,"x-form-arrow-trigger")]'
                },
                advanced: {
                    realm: '//input[@id="realm-field"]/../img[contains(@class,"x-form-arrow-trigger")]',
                    filters: '//input[@id="search-field"]/../img[contains(@class,"x-form-arrow-trigger")]',
                    values: '//input[@id="search-value"]/../img[contains(@class,"x-form-arrow-trigger")]'
                },
                results: {
                    byJobId: function (jobid) {
                        return '//div[@id="search_results"]//div[contains(@class,"x-grid3-col-1") and contains(text(),"' + jobid + '")]';
                    },
                    all: '//div[@id="search_results"]//div[contains(@class,"x-grid3-col-1")]'
                }
            },
            history: {
                search: {
                    contextMenu: {
                        container: 'div.x-menu.x-menu-floating.x-layer.x-menu-plain[style*="visibility: visible"]',
                        buttons: {
                            editSearch: '#x-menu-el-job-viewer-search-history-context-edit-search',
                            byText: function (text) {
                                return '//ul[@class="x-menu-list"]/li//span[contains(text(), "' + text + '")]';
                            },
                            recordDelete: '#job-viewer-search-history-context-record-delete',
                            deleteAllSearches: '#x-menu-el-job-viewer-search-history-context-realm-delete'
                        }
                    }
                },
                assist: '//span[contains(@class, "x-panel-header-text") and contains(text(), "Search History")]/../../div//b[contains(text(), "No saved searches")]',
                tree: {
                    node: function (name, checkIfSelected = false) {
                        var extra = '';
                        if (checkIfSelected === true) {
                            extra = ' and contains(@class, "x-tree-selected")';
                        }
                        return '//div[@id="jobviewer_search_history_panel"]//div[@class="x-tree-root-node"]//div[contains(@class,"x-tree-node-el")' + extra + ']//span[contains(text(),"' + name + '")]';
                    },
                    searchnode: function (name) {
                        return module.exports.selectors.history.tree.node(name) + '/ancestor::node()[2]/img[contains(@class,"search")]';
                    },
                    jobnode: function (searchName, jobName) {
                        return module.exports.selectors.history.tree.searchnode(searchName) + '/ancestor::node()[3]//span[contains(text(),"' + jobName + '")]';
                    },
                    jobsubnode: function (searchName, jobName, nodeText) {
                        return module.exports.selectors.history.tree.jobnode(searchName, jobName) + '/ancestor::node()[3]//span[contains(text(),"' + nodeText + '")]';
                    },
                    jobsubnode_selected: function (searchName, jobName, nodeText) {
                        // only match the tree node if the node is selected
                        return module.exports.selectors.history.tree.jobnode(searchName, jobName) + '/ancestor::node()[3]//div[contains(@class, "x-tree-selected")]/a/span[contains(text(),"' + nodeText + '")]';
                    },
                    unfoldsubnode: function (searchName, jobName, nodeText) {
                        return module.exports.selectors.history.tree.jobsubnode(searchName, jobName, nodeText) + '/ancestor::node()[2]/img[contains(@class,"x-tree-ec-icon")]';
                    }
                }
            },
            info: {
                container: '#info_display_container',
                tabByName: function (name) {
                    return '//div[@id="info_display"]//span[contains(@class,"x-tab-strip-text") and contains(text(),"' + name + '")]';
                },
                tabById: function (jobid, infoid, extra) {
                    var infomap = {
                        0: 'kv',
                        2: 'nested',
                        4: 'kv',
                        5: 'metrics'
                    };
                    var restrictions = '';
                    if (extra) {
                        restrictions = extra;
                    }

                    return '//li[contains(@id,"__infoid_' + infoid + '_' + jobid + '_' + infomap[infoid] + '")' + restrictions + ']';
                },
                tabById_active: function (jobid, infoid) {
                    return module.exports.selectors.info.tabById(jobid, infoid, ' and contains(@class, "x-tab-strip-active")');
                },
                chart: {
                    titleByContainer: function (container) {
                        // tsid_cpuuser_57874_chart
                        return '//div[@id="' + container + '"]//*[local-name() = "svg"]//*[name()="text" and @class="undefinedtitle"]/*[name()="tspan"]';
                    },
                    title: function (container, title) {
                        // tsid_cpuuser_57874_chart
                        return '//div[@id="' + container + '"]//*[local-name() = "svg"]//*[name()="text" and @class="undefinedtitle"]/*[name()="tspan" and contains(text(),"' + title + '")]';
                    }
                }
            },
            extMsgWindow: function (title) {
                return '//span[@class="x-window-header-text" and contains(text(), "' + title + '")]/ancestor::node()[5]';
            },
            extMsgWindowButton: function (title, buttonText) {
                return module.exports.selectors.extMsgWindow(title) + '//button[contains(text(), "' + buttonText + '")]';
            },
            extComboListByName: function (name) {
                return '//*[contains(@class, "x-combo-list") and contains(@style, "visibility: visible;")]//*[contains(@class, "x-combo-list-item") and text()="' + name + '"]';
            }
        };
    }
    performSearch(jobID, saveName, comboList, saveSearch) {
        browser.waitForVisible(this.selectors.search.window);
        browser.waitAndClick(this.selectors.search.basic.resource_dropdown);
        browser.waitAndClick(this.selectors.extComboListByName(comboList));
        browser.click(this.selectors.search.basic.jobIdLabel);
        browser.setValue('#basic-localjobid', jobID);
        browser.click(this.selectors.search.basic.jobIdLabel);
        if (saveSearch) {
            browser.setValue('#job-viewer-search-name', saveName);
            browser.click(this.selectors.search.basic.jobIdLabel);
        }
        browser.click('#job-viewer-search-lookup button');
        if (saveSearch) {
            browser.waitForExist('#job-viewer-search-panel div.ext-el-mask', 30000, true);
            browser.click('#job-viewer-search-save-results button');
            browser.waitForInvisible(this.selectors.search.window);
        }
    }
    viewSaveJob(jobID, saveName) {
        browser.waitAndClick(this.selectors.history.tree.jobnode(saveName, jobID));
        browser.waitUntilAnimEnd(this.selectors.history.tree.jobnode(saveName, jobID) + '/ancestor::node()[3]//span[contains(text(),"Timeseries")]');
        browser.waitForExist(this.selectors.info.tabByName(jobID));
    }
    performDelete(searchName, expectEmptyHistory) {
        browser.waitForVisible('#job-viewer-search-history-context-record-delete', 30000);
        browser.click('#job-viewer-search-history-context-record-delete');
        browser.waitForVisible(this.selectors.extMsgWindow('Delete All Saved Searches?'), 30000);
        browser.click(this.selectors.extMsgWindowButton('Delete All Saved Searches?', 'Yes'));
        browser.waitForInvisible(this.selectors.extMsgWindow('Delete All Saved Searches?'), 30000);
        browser.waitUntilNotExist(this.selectors.info.tabByName(searchName));
        if (expectEmptyHistory === false) {
            browser.waitUntilAnimEnd(this.selectors.history.tree.node('SUPREMM', true));
        } else {
            browser.waitForVisible(this.selectors.history.assist);
        }
    }
    addFiltersRunSearch(saveSearchName) {
        browser.waitForVisible(this.selectors.search.window);
        browser.waitAndSet('#search_start_date', '2016-12-30');
        browser.waitAndSet('#search_end_date', '2017-01-02');
        browser.waitAndSet('#job-viewer-search-name', saveSearchName, true, false);
        browser.click(this.selectors.search.advanced.realm);
        browser.waitAndClick(this.selectors.extComboListByName('SUPREMM'));
        browser.click(this.selectors.search.advanced.filters);
        browser.waitAndClick(this.selectors.extComboListByName('Job Size'));
        browser.click(this.selectors.search.advanced.values);
        browser.waitAndClick(this.selectors.extComboListByName('65 - 128'));
        browser.waitAndClick('#search-add button');
        browser.click(this.selectors.search.advanced.filters);
        browser.waitAndClick(this.selectors.extComboListByName('Exit Status'));
        browser.click(this.selectors.search.advanced.values);
        browser.waitAndClick(this.selectors.extComboListByName('CANCELLED'));
        browser.waitAndClick('#search-add button');
        browser.waitAndClick('#job-viewer-search-search button');
    }
    viewSavedJobTimeseries(saveSearchName, jobIdent, user, timeseries, host, metric) {
        browser.waitAndClick(this.selectors.history.tree.jobnode(saveSearchName, jobIdent));
        browser.waitUntilAnimEnd(this.selectors.history.tree.jobsubnode(saveSearchName, jobIdent, timeseries));
        browser.click(this.selectors.history.tree.unfoldsubnode(saveSearchName, jobIdent, timeseries));
        browser.waitUntilAnimEndAndClick(this.selectors.history.tree.jobsubnode(saveSearchName, jobIdent, user));

        var jobid = this.getJobIdFromJobTab(this.selectors.info.tabByName(jobIdent));
        var tsidUser = metric + '_' + jobid + '_chart';

        browser.waitForExist(this.selectors.info.chart.titleByContainer(tsidUser), 12000);
        expect(browser.getText(this.selectors.info.chart.titleByContainer(tsidUser))).to.equal(user);
        browser.waitUntilAnimEndAndClick(this.selectors.history.tree.unfoldsubnode(saveSearchName, jobIdent, user));
        browser.waitUntilAnimEndAndClick(this.selectors.history.tree.jobsubnode(saveSearchName, jobIdent, host));
        browser.waitForExist(this.selectors.info.chart.title(tsidUser, user + ' for host ' + host));
        browser.waitUntilAnimEndAndClick(this.selectors.history.tree.jobsubnode(saveSearchName, jobIdent, user));
        browser.waitForExist(this.selectors.info.chart.title(tsidUser, user));
    }
    changeJobNumber(nextJobId) {
        browser.click(this.selectors.search.basic.jobIdLabel);
        browser.click('#basic-localjobid');
        browser.setValue('#basic-localjobid', nextJobId);
        browser.click(this.selectors.search.basic.jobIdLabel);
        expect(browser.getValue(this.selectors.search.basic.jobId)).to.equal(nextJobId + '');
        browser.click('#job-viewer-search-lookup button');
        browser.waitForExist('#job-viewer-search-panel div.ext-el-mask', 30000, true);
        browser.click('#job-viewer-search-save-results button');
        browser.waitForVisible(this.selectors.search.window, 30000, true);
    }

    getJobIdFromJobTab(tab) {
        var tabId = browser.getAttribute(tab + '/ancestor::node()[4]', 'id');
        var matches = /info_display__jobid_([0-9]+)/.exec(tabId);
        expect(matches, 'Regex match of ID field of job tab').to.not.be.null;

        return matches[1];
    }

    viewSavedJobsTreeNav(saveSearchName, jobs) {
        browser.waitUntilAnimEnd(this.selectors.history.tree.jobnode(saveSearchName, jobs[0].ident));
        browser.waitAndClick(this.selectors.history.tree.jobnode(saveSearchName, jobs[0].ident));
        browser.waitUntilAnimEnd(this.selectors.history.tree.jobsubnode(saveSearchName, jobs[0].ident, 'Timeseries'));
        browser.waitForExist(this.selectors.info.tabByName(jobs[0].ident));

        var jobid = this.getJobIdFromJobTab(this.selectors.info.tabByName(jobs[0].ident));

        browser.waitForExist(this.selectors.history.tree.jobsubnode_selected(saveSearchName, jobs[0].ident, 'Accounting data'));
        browser.waitAndClick(this.selectors.history.tree.jobnode(saveSearchName, jobs[1].ident));
        browser.waitUntilAnimEnd(this.selectors.history.tree.jobsubnode(saveSearchName, jobs[1].ident, 'Timeseries'));
        browser.waitForExist(this.selectors.info.tabByName(jobs[1].ident));
        browser.waitAndClick(this.selectors.history.tree.jobsubnode(saveSearchName, jobs[0].ident, 'Executable information'));
        browser.waitForVisible(this.selectors.info.tabById(jobid, 0));
        browser.waitForVisible(this.selectors.info.tabById_active(jobid, 2));
    }
    viewSavedJobsTabsNav(saveSearchName, jobs) {
        browser.waitAndClick(this.selectors.info.tabById(jobs[0].jobid, 0));
        browser.waitForVisible(this.selectors.history.tree.jobsubnode_selected(saveSearchName, jobs[0].ident, 'Accounting data'));
        browser.waitAndClick(this.selectors.info.tabById(jobs[0].jobid, 2));
        browser.waitForVisible(this.selectors.history.tree.jobsubnode_selected(saveSearchName, jobs[0].ident, 'Executable information'));
        browser.waitAndClick(this.selectors.info.tabById(jobs[0].jobid, 4));
        browser.waitForVisible(this.selectors.history.tree.jobsubnode_selected(saveSearchName, jobs[0].ident, 'Summary metrics'));
        browser.waitAndClick(this.selectors.info.tabById(jobs[0].jobid, 5));
        browser.waitForVisible(this.selectors.history.tree.jobsubnode_selected(saveSearchName, jobs[0].ident, 'Detailed metrics'));
    }

    saveSearch() {
        browser.click('#job-viewer-search-save-results');
        browser.waitForInvisible(this.selectors.search.window);
    }

    fillInAdvancedSearch(startDate, endDate, searchNameAdvanced, criteriaName, criteriaValue) {
        browser.waitForVisible(this.selectors.search.window, 30000);
        browser.waitAndSet('#search_start_date', startDate);
        browser.waitAndSet('#search_end_date', endDate);
        browser.waitAndSet('#job-viewer-search-name', searchNameAdvanced, true, false);
        browser.click(this.selectors.search.advanced.filters);
        browser.waitAndClick(this.selectors.extComboListByName(criteriaName));
        browser.click(this.selectors.search.advanced.values);
        browser.waitAndClick(this.selectors.extComboListByName(criteriaValue));
        // The click on an entry low down the list on the advanced.values dropdown box causes the
        // whole window to scroll down on firefox on Ubuntu 14.04 (and possibly others).
        // The scroll(0,0) restores the view.
        browser.scroll(0, 0);
        browser.waitAndClick('#search-add button');
        browser.waitAndClick('#job-viewer-search-search button');
        browser.waitForVisible('#job-viewer-search-panel .ext-el-mask', 50000, true);
        var elems = browser.elements(this.selectors.search.results.all).value.slice();
        this.popclick(browser, elems);
        browser.waitForEnabled('#job-viewer-search-save-results', 30000);
    }
    deleteAllSearches() {
        browser.waitUntilAnimEndAndClick(this.selectors.history.tree.node('SUPREMM'), 'right');
        browser.waitForVisible(this.selectors.history.search.contextMenu.container, 30000);
        browser.click(this.selectors.history.search.contextMenu.buttons.deleteAllSearches);
        browser.waitForVisible(this.selectors.extMsgWindow('Delete All Saved Searches?'), 30000);
        browser.click(this.selectors.extMsgWindowButton('Delete All Saved Searches?', 'Yes'));
        browser.waitForVisible(this.selectors.history.assist);
    }
    changeSelectedRecords() {
        var elems = browser.elements(this.selectors.search.results.all).value.slice(-3);
        this.popclick(browser, elems);
        browser.click('#job-viewer-search-save-results button');
        browser.waitForVisible(this.selectors.search.window, 30000, true);
    }
    popclick(context, elems) {
        if (elems.length === 0) {
            return context;
        }
        return this.popclick(context.elementIdClick(elems.shift().ELEMENT), elems);
    }
    validateSearchDates(startDate, endDate) {
        expect(browser.getValue('#search_start_date')).to.equal(startDate);
        expect(browser.getValue('#search_end_date')).to.equal(endDate);
    }
    performEditSearch(searchNameAdvanced) {
        browser.waitUntilAnimEndAndClick(this.selectors.history.tree.searchnode(searchNameAdvanced), 'right');
        browser.waitForVisible(this.selectors.history.search.contextMenu.container, 30000);
        browser.waitAndClick(this.selectors.history.search.contextMenu.buttons.editSearch);
        browser.waitForVisible(this.selectors.search.window, 30000);
    }
    validateSearchParameters(resource, nextJobId, saveSearch = true) {
        browser.waitForVisible(this.selectors.search.window, 30000);
        browser.waitUntil(function () {
            var loaded = browser.execute("return Ext.getCmp('jobviewer_search_history_panel').loaded;");
            if (loaded) {
                return loaded;
            }
            return undefined;
        }, 30000);
        // Wait until the input field has been updated
        for (let i = 0; i < 100; i++) {
            if (browser.getValue(this.selectors.search.basic.resource) === resource) {
                break;
            }
            browser.pause(2);
        }
        expect(browser.getValue(this.selectors.search.basic.resource)).to.equal(resource);
        expect(browser.getValue(this.selectors.search.basic.jobId)).to.equal(nextJobId + '');

        if (saveSearch) {
            browser.click('#job-viewer-search-lookup button');
            browser.waitForExist('#job-viewer-search-panel div.ext-el-mask', 30000, true);
            browser.click('#job-viewer-search-save-results button');
            browser.waitForVisible(this.selectors.search.window, 30000, true);
        }
    }

    changeSortOrder(saveSearchName, jobIdent) {
        browser.waitUntilAnimEndAndClick(this.selectors.history.tree.node('SUPREMM'), 'right');
        browser.waitForExist(this.selectors.history.search.contextMenu.container);
        browser.waitAndClick(this.selectors.history.search.contextMenu.buttons.byText('Name'));
        browser.waitUntilAnimEnd(this.selectors.history.tree.jobnode(saveSearchName, jobIdent) + '/ancestor::node()[3]//span[contains(text(),"Timeseries")]');
    }
    selectEntryRawDataWindow() {
        browser.waitForVisible(this.meselectors.resizableWindowByTitle('Raw Data'), 30000);
        browser.waitForExist(this.meselectors.rawDataEntryByIndex(), 80000);
        var tabId = browser.getText(this.meselectors.rawDataEntryByIndex());
        browser.click(this.meselectors.rawDataEntryByIndex());
        return (tabId);
    }
    verifyEditSearchIsDisabled(chartTitle) {
        browser.waitUntilAnimEndAndClick(this.selectors.history.tree.searchnode(chartTitle), 'right', 30000);
        browser.waitForVisible(this.selectors.history.search.contextMenu.container, 30000);
        browser.waitAndClick(this.selectors.history.search.contextMenu.buttons.editSearch);
        // Click should do nothing - if it did something then the context menu would disappear
        browser.waitForVisible(this.selectors.history.search.contextMenu.container, 30000);
    }
}
module.exports = new JobViewer();

