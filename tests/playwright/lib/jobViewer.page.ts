import {expect} from 'playwright_ui_tests/index';
import {BasePage} from "playwright_ui_tests/lib/base.page";
import selectors from "./jobViewer.selectors";

class JobViewerPage extends BasePage {
    public readonly selectors = selectors;
    public readonly meselectors = {
        resizableWindowByTitle: function (title: string) {
            return '//div[contains(@class, "x-window") and contains(@class, "x-resizable-pinned") and contains(@style, "visibility: visible")]//span[@class="x-window-header-text" and text()[contains(.,"' + title + '")]]';
        },
        rawDataEntryByIndex: function (index = undefined) {
            const thisIndex = (index !== undefined) ? index : 1;
            return "(//div[contains(@class, 'x-window') and contains(@style, 'visibility: visible')]//div[contains(@class, 'x-grid3-body')]//div[contains(@class, 'x-grid3-cell-inner') and contains(@class, 'x-grid3-col-local_job_id')])[" + thisIndex + ']';
        },
    }

    async performSearch(jobId, saveName, comboList, saveSearch) {
        const searchButtonContainer = this.page.locator('//table[@id="job-viewer-search-lookup"]');

        await expect(this.page.locator(this.selectors.search.window)).toBeVisible();
        await this.page.click(this.selectors.search.basic.resource_dropdown);
        await this.page.click(this.selectors.extComboListByName(comboList));
        await this.page.click(this.selectors.search.basic.jobIdLabel);

        await expect(searchButtonContainer).toHaveClass(/x-item-disabled/);

        await this.page.locator('#basic-localjobid').pressSequentially(String(jobId));
        await this.page.click(this.selectors.search.basic.jobIdLabel);
        if (saveSearch) {
            await this.page.locator('#job-viewer-search-name').fill(saveName);
            await this.page.click(this.selectors.search.basic.jobIdLabel);
        }

        // The search button should be enabled by now.
        await expect(searchButtonContainer).not.toHaveClass('x-item-disabled');

        const searchButton = this.page.locator('//table[@id="job-viewer-search-lookup"]//button');
        await searchButton.click();

        // wait for a successful response to the search to return.
        await this.page.waitForResponse((res) => /warehouse\/search\/jobs/.test(res.url()) && res.status() === 200);

        if (saveSearch) {
            // check that the returned record has been
            await expect(this.page.locator(this.selectors.search.results.included.byJobId(jobId))).toBeVisible();

            // At this point the 'Save Result' (#job-viewer-search-save-results) button should not have the class x-item-disabled
            await expect(this.page.locator(this.selectors.search.footer.saveResults)).not.toHaveClass('x-item-disabled');

            const saveButton = this.page.locator(this.selectors.search.footer.saveResults + '//button');
            await saveButton.click();

            // await this.page.waitForRequest((req) => /warehouse\/search\/history/.test(req.url()) && req.method() === 'POST');
            // make sure we see a successful response before continuing.
            await this.page.waitForResponse((res) => /warehouse\/search\/history/.test(res.url()) && res.status() === 200);
            await expect(this.page.locator(this.selectors.search.window)).toBeHidden({timeout: 10000});
        }
    }

    async viewSaveJob(jobID, saveName) {
        const nodeSelector = this.selectors.history.tree.jobnode(saveName, jobID);
        const locator = this.page.locator(nodeSelector);
        await locator.isVisible();
        await locator.click();
        await this.page.locator(nodeSelector + '/ancestor::node()[3]//span[contains(text(),"Timeseries")]').isVisible();
        await expect(this.page.locator(this.selectors.info.tabByName(jobID))).toBeVisible();
    }

    async performDelete(searchName, expectEmptyHistory) {
        await expect(this.page.locator('#job-viewer-search-history-context-record-delete')).toBeVisible();
        await this.page.locator('#job-viewer-search-history-context-record-delete').click();

        await expect(this.page.locator(this.selectors.extMsgWindow('Delete All Saved Searches?'))).toBeVisible();
        await this.page.screenshot({path: 'before_delete_confirmation.png'});
        await this.page.click(this.selectors.extMsgWindowButton('Delete All Saved Searches?', 'Yes'));
        await this.page.screenshot({path: 'after_delete_confirmation.png'});
        await expect(this.page.locator(this.selectors.extMsgWindow('Delete All Saved Searches?'))).toBeHidden();
        await expect(this.page.locator(this.selectors.info.tabByName(searchName))).toBeHidden();

        if (expectEmptyHistory === false) {
            await expect(this.page.locator(this.selectors.history.tree.node('SUPREMM', true))).toBeVisible();
        } else {
            await expect(this.page.locator(this.selectors.history.assist)).toBeVisible();
        }
    }

    async addFiltersRunSearch(saveSearchName) {
        await expect(this.page.locator(this.selectors.search.window)).toBeVisible();
        await expect(this.page.locator('#search_start_date')).toBeVisible();
        await this.page.locator('#search_start_date').fill('2016-12-30');
        await this.page.locator('#search_end_date').fill('2017-01-02');
        await this.page.locator('#job-viewer-search-name').fill(saveSearchName);
        await expect(this.page.locator(this.selectors.search.advanced.realm)).toBeVisible();
        await this.page.locator(this.selectors.search.advanced.realm).click();
        await this.page.locator(this.selectors.extComboListByName('SUPREMM')).click();
        await this.page.locator(this.selectors.search.advanced.filters).click();
        await this.page.locator(this.selectors.extComboListByName('Job Size')).click();
        await this.page.locator(this.selectors.search.advanced.values).click();
        await this.page.locator(this.selectors.extComboListByName('65 - 128')).click();
        await this.page.locator('#search-add button').click();
        await this.page.locator(this.selectors.search.advanced.filters).click();
        await this.page.locator(this.selectors.extComboListByName('Exit Status')).click();
        await this.page.locator(this.selectors.search.advanced.values).click();
        await this.page.locator(this.selectors.extComboListByName('CANCELLED')).click();
        await this.page.locator('#search-add button').click();
        await this.page.locator('#job-viewer-search-search button').click();
    }

    async viewSavedJobTimeseries(saveSearchName, jobIdent, user, timeseries, host, metric) {
        await expect(this.page.locator(this.selectors.history.tree.jobnode(saveSearchName, jobIdent))).toBeVisible();
        await this.page.click(this.selectors.history.tree.jobnode(saveSearchName, jobIdent));
        await this.page.isVisible(this.selectors.history.tree.jobsubnode(saveSearchName, jobIdent, timeseries));
        await this.page.click(this.selectors.history.tree.unfoldsubnode(saveSearchName, jobIdent, timeseries));
        await this.page.click(this.selectors.history.tree.jobsubnode(saveSearchName, jobIdent, user));

        var jobid = await this.getJobIdFromJobTab(this.selectors.info.tabByName(jobIdent));
        var tsidUser = metric + '_' + jobid + '_chart';
        const titleByContainerLocator = this.page.locator(this.selectors.info.chart.titleByContainer(tsidUser));
        await expect(titleByContainerLocator).not.toBeVisible();
        await expect(titleByContainerLocator).toHaveText(user);

        await this.page.click(this.selectors.history.tree.unfoldsubnode(saveSearchName, jobIdent, user));
        await this.page.click(this.selectors.history.tree.jobsubnode(saveSearchName, jobIdent, host));
        await expect(this.page.locator(this.selectors.info.chart.title(tsidUser, user + ' for host ' + host))).toBeVisible();
        await this.page.click(this.selectors.history.tree.jobsubnode(saveSearchName, jobIdent, user));
        await expect(this.page.locator(this.selectors.info.chart.title(tsidUser, user))).toBeVisible();
    }

    async changeJobNumber(nextJobId) {
        await this.page.click(this.selectors.search.basic.jobIdLabel);
        await this.page.click('#basic-localjobid');
        await this.page.fill('#basic-localjobid', String(nextJobId));
        await this.page.click(this.selectors.search.basic.jobIdLabel);
        await expect(this.page.locator(this.selectors.search.basic.jobId)).toBeVisible();
        await expect(this.page.locator(this.selectors.search.basic.jobId)).toHaveValue(nextJobId + '');
        await this.page.click('#job-viewer-search-lookup button');
        await this.page.click('#job-viewer-search-save-results button');
        await expect(this.page.locator(this.selectors.search.window)).not.toBeVisible();
    }

    async getJobIdFromJobTab(tab) {
        const tabId = await this.page.locator(tab + '/ancestor::node()[4]').getAttribute('id');
        const matches = /info_display__jobid_([0-9]+)/.exec(tabId);
        expect(matches, 'Regex match of ID field of job tab').toBeTruthy();
        return matches[1];
    }

    async viewSavedJobsTreeNav(saveSearchName, jobs) {
        await expect(this.page.locator(this.selectors.history.tree.jobnode(saveSearchName, jobs[0].ident))).toBeVisible();
        await this.page.click(this.selectors.history.tree.jobnode(saveSearchName, jobs[0].ident));
        await expect(this.page.locator(this.selectors.history.tree.jobsubnode(saveSearchName, jobs[0].ident, 'Timeseries'))).toBeVisible();
        await expect(this.page.locator(this.selectors.info.tabByName(jobs[0].ident))).toBeVisible();

        const jobid = await this.getJobIdFromJobTab(this.selectors.info.tabByName(jobs[0].ident));

        await expect(this.page.locator(this.selectors.history.tree.jobsubnode_selected(saveSearchName, jobs[0].ident, 'Accounting data'))).toBeVisible();
        await this.page.click(this.selectors.history.tree.jobnode(saveSearchName, jobs[1].ident));
        await expect(this.page.locator(this.selectors.history.tree.jobsubnode(saveSearchName, jobs[1].ident, 'Timeseries'))).toBeVisible();
        await expect(this.page.locator(this.selectors.info.tabByName(jobs[1].ident))).toBeVisible();
        await this.page.click(this.selectors.history.tree.jobsubnode(saveSearchName, jobs[0].ident, 'Executable information'));

        await expect(this.page.locator(this.selectors.info.tabById(jobid, 0))).toBeVisible();
        await expect(this.page.locator(this.selectors.info.tabById_active(jobid, 2))).toBeVisible();
    }

    async viewSavedJobsTabsNav(saveSearchName, jobs) {
        await this.page.click(this.selectors.info.tabById(jobs[0].jobid, 0));
        await expect(this.page.locator(this.selectors.history.tree.jobsubnode_selected(saveSearchName, jobs[0].ident, 'Accounting data'))).toBeVisible();
        await this.page.click(this.selectors.info.tabById(jobs[0].jobid, 2));
        await expect(this.page.locator(this.selectors.history.tree.jobsubnode_selected(saveSearchName, jobs[0].ident, 'Executable information'))).toBeVisible();
        await this.page.click(this.selectors.info.tabById(jobs[0].jobid, 4));
        await expect(this.page.locator(this.selectors.history.tree.jobsubnode_selected(saveSearchName, jobs[0].ident, 'Summary metrics'))).toBeVisible();
        await this.page.click(this.selectors.info.tabById(jobs[0].jobid, 5));
        await expect(this.page.locator(this.selectors.history.tree.jobsubnode_selected(saveSearchName, jobs[0].ident, 'Detailed metrics'))).toBeVisible();
    }

    async saveSearch() {

        await this.page.screenshot({path: 'before_save.png'});
        const saveButton = this.page.locator(this.selectors.search.footer.saveResults + '//button');
        await saveButton.click();
        await this.page.waitForResponse((res) => /warehouse\/search\/history/.test(res.url()) && res.status() === 200);
        await expect(this.page.locator(this.selectors.search.window)).toBeHidden();
        await this.page.screenshot({path: 'search_saved.png'});
    }

    async fillInAdvancedSearch(startDate: string, endDate: string, searchNameAdvanced, criteriaName, criteriaValue) {
        await expect(this.page.locator(this.selectors.search.window)).toBeVisible();

        await this.page.fill(this.selectors.search.advanced.start_date, startDate);
        await this.page.fill(this.selectors.search.advanced.end_date, endDate);

        await expect(this.page.locator(this.selectors.search.advanced.start_date)).toHaveValue(startDate);
        await expect(this.page.locator(this.selectors.search.advanced.end_date)).toHaveValue(endDate);

        await this.page.fill(this.selectors.search.name, searchNameAdvanced);
        await expect(this.page.locator(this.selectors.search.name)).toHaveValue(searchNameAdvanced);

        await this.page.click(this.selectors.search.advanced.filters);
        await this.page.click(this.selectors.extComboListByName(criteriaName));
        await this.page.click(this.selectors.search.advanced.values);
        await this.page.click(this.selectors.extComboListByName(criteriaValue));

        const addButton = this.page.locator('#search-add button');
        await addButton.click();

        const searchButton = this.page.locator('#job-viewer-search-search button');
        await searchButton.click();
        await this.page.waitForResponse((res) => /warehouse\/search\/jobs/.test(res.url()) && res.status() === 200);

        await this.page.screenshot({path: 'after_search_pressed.png'});

        const searchResults = this.page.locator(this.selectors.search.results.all);
        await expect(searchResults).toHaveCount(5);
        const count = await searchResults.count();
        for (let i = 0; i <= count -1; i++) {
            await searchResults.nth(i).click();
        }

        await this.page.screenshot({path: 'after_clicky.png'});
        await expect(this.page.locator('#job-viewer-search-save-results')).toBeEnabled()
    }

    async deleteAllSearches() {
        const supremmSearch = this.page.locator(this.selectors.history.tree.node('SUPREMM'));
        await supremmSearch.click({button: "right"});
        await expect(this.page.locator(this.selectors.history.search.contextMenu.container)).toBeVisible();
        await this.page.click(this.selectors.history.search.contextMenu.buttons.deleteAllSearches);
        await expect(this.page.locator(this.selectors.extMsgWindow('Delete All Saved Searches?'))).toBeVisible();
        await this.page.click(this.selectors.extMsgWindowButton('Delete All Saved Searches?', 'Yes'));
        await expect(this.page.locator(this.selectors.history.assist)).toBeVisible();
    }

    async changeSelectedRecords() {
        const searchResults = this.page.locator(this.selectors.search.results.all);
        const count = await searchResults.count();
        let max = 3;
        let j = 1;
        for (let i = count -1; i >= 0; i--) {
            if (j === max) {
                break;
            }
            await searchResults.nth(i).click();
            j++;
        }

        await this.page.click('#job-viewer-search-save-results button');
        await expect(this.page.locator(this.selectors.search.window)).toBeVisible();
    }

    async validateSearchDates(startDate, endDate) {
        await expect(this.page.locator('#search_start_date')).toHaveValue(startDate);
        await expect(this.page.locator('#search_end_date')).toHaveValue(endDate);
    }

    async performEditSearch(searchNameAdvanced) {
        const searchNameAdvancedLocator = this.page.locator(this.selectors.history.tree.searchnode(searchNameAdvanced));
        await searchNameAdvancedLocator.click({button: "right"});
        await expect(this.page.locator(this.selectors.history.search.contextMenu.container)).toBeVisible();
        await this.page.click(this.selectors.history.search.contextMenu.buttons.editSearch);
        await expect(this.page.locator(this.selectors.search.window)).toBeVisible();
    }

    async validateSearchParameters(resource, nextJobId, saveSearch = true) {
        await expect(this.page.locator(this.selectors.search.window)).toBeVisible();
        await expect(this.page.locator(this.selectors.search.basic.resource)).toHaveValue(resource);
        await expect(this.page.locator(this.selectors.search.basic.jobId)).toHaveValue(nextJobId + '');
        if (saveSearch) {
            await this.page.click('#job-viewer-search-lookup button');
            await expect(this.page.locator('#job-viewer-search-save-results button')).toBeVisible();
            await this.page.click('#job-viewer-search-save-results button');
            await expect(this.page.locator(this.selectors.search.window)).toBeVisible()
        }
    }

    async changeSortOrder(saveSearchName, jobIdent) {
        const nodeLocator = this.page.locator(this.selectors.history.tree.node('SUPREMM'));
        await nodeLocator.click({button: "right"});
        await expect(this.page.locator(this.selectors.history.search.contextMenu.container)).toBeVisible();
        await this.page.click(this.selectors.history.search.contextMenu.buttons.byText('Name'));
        await expect(this.page.locator(this.selectors.history.tree.jobnode(saveSearchName, jobIdent) + '/ancestor::node()[3]//span[contains(text(),"Timeseries")]')).toBeVisible();
    }

    async selectEntryRawDataWindow() {
        await expect(this.page.locator(this.meselectors.resizableWindowByTitle('Raw Data'))).toBeVisible();
        await expect(this.page.locator(this.meselectors.rawDataEntryByIndex())).toBeVisible();
        const tabId = await this.page.textContent(this.meselectors.rawDataEntryByIndex());
        await this.page.click(this.meselectors.rawDataEntryByIndex());
        return tabId;
    }

    async verifyEditSearchIsDisabled(chartTitle) {
        await this.page.locator(this.selectors.history.tree.searchnode(chartTitle)).click({button: "right"});
        await expect(this.page.locator(this.selectors.history.search.contextMenu.container)).toBeVisible();
        await this.page.click(this.selectors.history.search.contextMenu.buttons.editSearch);
        // Click should do nothing - if it did something then the context menu would disappear
        await expect(this.page.locator(this.selectors.history.search.contextMenu.container)).toBeVisible();
    }

    async clickLogoAndWaitForMask() {
        return this.page.click('xtb-text.logo93');
    }
}

export default JobViewerPage;
