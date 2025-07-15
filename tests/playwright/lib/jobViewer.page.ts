import {expect} from '@playwright/test';
import {BasePage} from "./base.page";
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
        await expect(this.page.locator(this.selectors.search.window)).toBeVisible();
        await this.page.click(this.selectors.search.basic.resource_dropdown);
        await this.page.click(this.selectors.extComboListByName(comboList));
        await this.page.click(this.selectors.search.basic.jobIdLabel);
        await this.page.locator('#basic-localjobid').fill(jobId);
        await this.page.click(this.selectors.search.basic.jobIdLabel);
        if (saveSearch) {
            await this.page.locator('#job-viewer-search-name').fill(saveName);
            await this.page.click(this.selectors.search.basic.jobIdLabel);
        }
        await this.page.click('#job-viewer-search-lookup button');
        if (saveSearch) {
            await this.page.locator('#job-viewer-search-panel div.ext-el-mask').isVisible();
            await this.page.click('#job-viewer-search-save-results button');
            await this.page.locator(this.selectors.search.window).isHidden();
        }
    }

    async viewSaveJob(jobID, saveName) {
        const nodeSelector = this.selectors.history.tree.jobnode(saveName, jobID);
        await this.page.locator(nodeSelector).isVisible();
        await this.page.click(nodeSelector);
        await this.page.locator(nodeSelector + '/ancestor::node()[3]//span[contains(text(),"Timeseries")]').isVisible();
        await this.page.locator(this.selectors.info.tabByName(jobID)).isVisible();
    }

    async performDelete(searchName, expectEmptyHistory) {
        await expect(this.page.locator('#job-viewer-search-history-context-record-delete')).toBeVisible();
        await this.page.locator('#job-viewer-search-history-context-record-delete').click();

        await expect(this.page.locator(this.selectors.extMsgWindow('Delete All Saved Searches?'))).toBeVisible();
        await this.page.click(this.selectors.extMsgWindowButton('Delete All Saved Searches?', 'Yes'));

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

        var jobid = this.getJobIdFromJobTab(this.selectors.info.tabByName(jobIdent));
        var tsidUser = metric + '_' + jobid + '_chart';

        await expect(this.page.locator(this.selectors.info.chart.titleByContainer(tsidUser))).toBeVisible();
        expect(this.page.textContent(this.selectors.info.chart.titleByContainer(tsidUser))).toEqual(user);

        await this.page.click(this.selectors.history.tree.unfoldsubnode(saveSearchName, jobIdent, user));
        await this.page.click(this.selectors.history.tree.jobsubnode(saveSearchName, jobIdent, host));
        await expect(this.page.locator(this.selectors.info.chart.title(tsidUser, user + ' for host ' + host))).toBeVisible();
        await this.page.click(this.selectors.history.tree.jobsubnode(saveSearchName, jobIdent, user));
        await expect(this.page.locator(this.selectors.info.chart.title(tsidUser, user))).toBeVisible();
    }

    async changeJobNumber(nextJobId) {
        await this.page.click(this.selectors.search.basic.jobIdLabel);
        await this.page.click('#basic-localjobid');
        await this.page.fill('#basic-localjobid', nextJobId);
        await this.page.click(this.selectors.search.basic.jobIdLabel);
        await expect(this.page.locator(this.selectors.search.basic.jobId)).toBeVisible();
        expect(this.page.inputValue(this.selectors.search.basic.jobId)).toEqual(nextJobId + '');
        await this.page.click('#job-viewer-search-lookup button');
        await this.page.click('#job-viewer-search-save-results button');
        await expect(this.page.locator(this.selectors.search.window)).toBeVisible();
    }

    async getJobIdFromJobTab(tab) {
        const tabId = await this.page.locator(tab + '/ancestor::node()[4]').getAttribute('id');
        const matches = /info_display__jobid_([0-9]+)/.exec(tabId);
        expect(matches, 'Regex match of ID field of job tab').toBeNull();
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
        await this.page.click('#job-viewer-search-save-results');
        await expect(this.page.locator(this.selectors.search.window)).toBeHidden();
    }

    async fillInAdvancedSearch(startDate, endDate, searchNameAdvanced, criteriaName, criteriaValue) {
        await expect(this.page.locator(this.selectors.search.window)).toBeVisible();
        await this.page.inputValue('#search_start_date', startDate);
        await this.page.inputValue('#search_end_date', endDate);
        await this.page.inputValue('#job-viewer-search-name', searchNameAdvanced);
        await this.page.click(this.selectors.search.advanced.filters);
        await this.page.click(this.selectors.extComboListByName(criteriaName));
        await this.page.click(this.selectors.search.advanced.values);
        await this.page.click(this.selectors.extComboListByName(criteriaValue));

        // The click on an entry low down the list on the advanced.values dropdown box causes the
        // whole window to scroll down on firefox on Ubuntu 14.04 (and possibly others).
        // The scroll(0,0) restores the view.
        window.scrollTo(0, 0);
        await this.page.click('#search-add button');
        await this.page.click('#job-viewer-search-search button');
        const searchResults = this.page.locator(this.selectors.search.results.all);
        await expect(searchResults).toBeVisible();
        const count = await searchResults.count();
        for (let i = 0; i <= count; i++) {
            await searchResults.nth(i).click();
        }
        await expect(this.page.locator('#job-viewer-search-save-results')).toBeEnabled()
    }

    async deleteAllSearches() {
        await this.page.click(this.selectors.history.tree.node('SUPREMM'));
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
        for (let i = count; i >= 0; i--) {
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
        await this.page.click(this.selectors.history.tree.searchnode(searchNameAdvanced));
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
        await this.page.click(this.selectors.history.tree.node('SUPREMM'));
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
        await this.page.click(this.selectors.history.tree.searchnode(chartTitle));
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
