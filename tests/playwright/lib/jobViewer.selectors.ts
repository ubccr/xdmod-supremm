const selectors = {
    tab: '#main_tab_panel__job_viewer',
    container: '#job_viewer',
    search: {
        button: '#job_viewer button.x-btn-text.search',
        window: '#search-window',
        name: '//input[@id="job-viewer-search-name"]',
        basic: {
            resource: '#basic-resource',
            jobId: '//input[@id="basic-localjobid"]',
            jobIdLabel: 'label[for=basic-localjobid]',
            resource_dropdown: '//input[@id="basic-resource"]/../img[contains(@class,"x-form-arrow-trigger")]'
        },
        advanced: {
            start_date: '//input[@id="search_start_date"]',
            end_date: '//input[@id="search_end_date"]',
            realm: '//input[@id="realm-field"]/../img[contains(@class,"x-form-arrow-trigger")]',
            filters: '//input[@id="search-field"]/../img[contains(@class,"x-form-arrow-trigger")]',
            values: '//input[@id="search-value"]/../img[contains(@class,"x-form-arrow-trigger")]'
        },
        results: {
            included: {
                byJobId: function(jobid) {
                    return '//div[@id="search_results"]//div[contains(@class,"x-grid3-col-1") and contains(text(),"' + jobid+ '")]/ancestor::tr//div[contains(@class, "x-grid3-col-included")]/div[contains(@class, "x-grid3-check-col-on")]';
                },
                all: '//div[@id="search_results"]//div[contains(@class, "x-grid3-col-included")]/div[contains(@class, "x-grid3-check-col-on")]'
            },
            byJobId: function (jobid) {
                return '//div[@id="search_results"]//div[contains(@class,"x-grid3-col-1") and contains(text(),"' + jobid + '")]';
            },
            all: '//div[@id="search_results"]//div[contains(@class,"x-grid3-col-1")]'
        },
        footer: {
            saveAs: '//div[@id="search-window"]//table[@id="job-viewer-search-save-as"]',
            saveResults: '//div[@id="search-window"]//table[@id="job-viewer-search-save-results"]',
            cancel: '//div[@id="search-window"]//table[@id="job-viewer-search-cancel"]'
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
                return selectors.history.tree.node(name) + '/ancestor::node()[2]/img[contains(@class,"search")]';
            },
            jobnode: function (searchName, jobName) {
                return selectors.history.tree.searchnode(searchName) + '/ancestor::node()[3]//span[contains(text(),"' + jobName + '")]';
            },
            jobsubnode: function (searchName, jobName, nodeText) {
                return selectors.history.tree.jobnode(searchName, jobName) + '/ancestor::node()[3]//span[contains(text(),"' + nodeText + '")]';
            },
            jobsubnode_selected: function (searchName, jobName, nodeText) {
                // only match the tree node if the node is selected
                return selectors.history.tree.jobnode(searchName, jobName) + '/ancestor::node()[3]//div[contains(@class, "x-tree-selected")]/a/span[contains(text(),"' + nodeText + '")]';
            },
            unfoldsubnode: function (searchName, jobName, nodeText) {
                return selectors.history.tree.jobsubnode(searchName, jobName, nodeText) + '/ancestor::node()[2]/img[contains(@class,"x-tree-ec-icon")]';
            }
        }
    },
    info: {
        container: '#info_display_container',
        tabByName: function (name) {
            return '//div[@id="info_display"]//span[contains(@class,"x-tab-strip-text") and contains(text(),"' + name + '")]';
        },
        tabById: function (jobid, infoid, extra=undefined) {
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
            return selectors.info.tabById(jobid, infoid, ' and contains(@class, "x-tab-strip-active")');
        },
        chart: {
            titleByContainer: function (container) {
                // tsid_cpuuser_57874_chart
                return '//div[@id="' + container + '"]//*[local-name() = "svg"]//*[@class="infolayer"]//*[name()="text" and @class = "gtitle"]';
            },
            title: function (container, title) {
                // tsid_cpuuser_57874_chart
                return '//div[@id="' + container + '"]//*[local-name() = "svg"]//*[@class="infolayer"]//*[name()="text" and @class = "gtitle"][contains(text(),"' + title + '")]';
            }
        }
    },
    extMsgWindow: function (title) {
        return '//span[@class="x-window-header-text" and contains(text(), "' + title + '")]/ancestor::node()[5]';
    },
    extMsgWindowButton: function (title, buttonText) {
        return selectors.extMsgWindow(title) + '//button[contains(text(), "' + buttonText + '")]';
    },
    extComboListByName: function (name) {
        return '//*[contains(@class, "x-combo-list") and contains(@style, "visibility: visible;")]//*[contains(@class, "x-combo-list-item") and text()="' + name + '"]';
    }
};

export default selectors;
