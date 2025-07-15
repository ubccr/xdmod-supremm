import {test, expect} from '@playwright/test';

// @ts-ignore
import {LoginPage} from '../../../../../xdmod/tests/playwright/lib/login.page';
// @ts-ignore
import globalConfig from '../../../../../xdmod/tests/playwright/playwright.config';
// @ts-ignore
import JobViewerPage from "../../lib/jobViewer.page";
// @ts-ignore
import xdmodPage from '../../../../../xdmod/tests/playwright/lib/xdmod.page';
// @ts-ignore
import me from '../../../../../xdmod/tests/playwright/lib/metricMexplorer.page';

test.describe('Job Viewer', async () => {
    let baseUrl = globalConfig.use.baseURL;
    await LoginPage.login('centerdirector');

    test('Select Tab', async ({page}) => {
        const jobViewer = new JobViewerPage(page, baseUrl);
        const selectors = jobViewer.selectors;

        await test.step('Selected', async () => {
            await page.click(selectors.tab);
            await expect(page.locator(selectors.container)).toBeVisible();
        });
        await test.step('Has Instructions', async () => {
            const instructions = 'No job is selected for viewing\\n\\nPlease refer to the instructions below:\\n\\n\\n\\nFor more information, please refer to the User Manual';
            await expect(page.locator(selectors.info.container + '  .x-grid-empty img[src="gui/images/job_viewer_instructions.png"]')).toBeVisible();
            await expect(page.locator(selectors.info.container + ' .x-grid-empty')).toHaveText(instructions)
        });
    });

    test('Quick Lookup', async ({page}) => {
        const jobViewer = new JobViewerPage(page, baseUrl);
        const selectors = jobViewer.selectors;

        await test.step('No results', async () => {
            await test.step('Click the search button', async () => {
                await page.click(selectors.search.button)
            });
            await test.step('Perform a basic search', async () => {
                await jobViewer.performSearch(123, '', 'robertson', false);
            });
            await test.step('Have no results', async () => {
                await expect(page.locator('#search_results .x-mask')).toBeVisible();
                await expect(page.locator('#search_results .x-mask')).toHaveText('Lookup returned zero jobs.');
                await expect(page.locator('#job-viewer-search-save-results .x-item-disabled')).toHaveCount(0);
            });
            await test.step('Cancel search', async () => {
                await page.click('#job-viewer-search-cancel');
                await expect(page.locator(selectors.search.window)).toBeHidden();
            });
        });

        await test.step('With results', async () => {
            const saveSearchName = 'AUTOTEST' + new Date();
            await test.step('Click the Search Button', async () => {
                await page.click(selectors.search.button);
            });
            await test.step('Perform a basic search', async () => {
                await jobViewer.performSearch(6118004, saveSearchName, 'robertson', true);
            });
            await test.step('View saved job then delete it.', async () => {
                const jobIdent = 'robertson-6118004';
                await jobViewer.viewSaveJob(jobIdent, saveSearchName);
                await page.click(selectors.history.tree.searchnode(saveSearchName));
                await jobViewer.performDelete(jobIdent, true);
                await jobViewer.clickLogoAndWaitForMask();
            });
        });

        await test.step('Basic search with conflicting settings in advanced search dialog box', async () => {
            const saveSearchName = 'AUTOTEST cross realm ' + new Date();
            await test.step('Click the search button', async () => {
                await page.click(selectors.search.button);
            });
            await test.step('Select non-supremm realm in advanced search box', async () => {
                await page.click(selectors.search.advanced.realm);
                await page.click(selectors.extComboListByName('Jobs'));
            });
            await test.step('Perform a basic search', async () => {
                await jobViewer.performSearch(6118004, saveSearchName, 'robertson', true);
            });
            await test.step('View saved job then delete it.', async () => {
                const jobIdent = 'robertson-6118004';
                await jobViewer.viewSaveJob(jobIdent, saveSearchName);
                await page.click(selectors.history.tree.searchnode(saveSearchName));
                await jobViewer.performDelete(jobIdent, true);
                await jobViewer.clickLogoAndWaitForMask();
            });
        });
    });

    test('Advanced Search', async ({page}) => {
        const saveSearchName = 'AUTOTEST ' + new Date();
        const jobViewer = new JobViewerPage(page, baseUrl);
        const selectors = jobViewer.selectors;

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
        await test.step('Simple single filter lookup', async () => {
            await test.step('Click the search button', async () => {
                await page.click(selectors.search.button);
            });
            await test.step('Add filters; Run Search', async () => {
                await jobViewer.addFiltersRunSearch(saveSearchName);
            });
            await test.step('Select Search Results', async () => {
                await page.click(selectors.search.results.byJobId(jobs[0].id));
                await page.click(selectors.search.results.byJobId(jobs[1].id));
                await jobViewer.saveSearch();
                await jobViewer.clickLogoAndWaitForMask();
            });
            await test.step('View saved jobs using tree navigation.', async () => {
                await jobViewer.viewSavedJobsTreeNav(saveSearchName, jobs);
            });
            await test.step('Delete saved search.', async () => {
                await page.click(selectors.history.tree.searchnode(saveSearchName));
                await jobViewer.performDelete(jobs[0].ident, true);
                await jobViewer.clickLogoAndWaitForMask();
            });
        });
    });


    test('Tree Sort Order', async ({page}) => {
        var jobIdent = 'robertson-6117006';
        var saveSearchName = 'AUTOTEST ' + new Date();

        const jobViewer = new JobViewerPage(page, baseUrl);
        const selectors = jobViewer.selectors;

        await test.step('Click the search button', async () => {
            await page.click(selectors.search.button);
        });
        await test.step('Perform a basic search', async () => {
            await jobViewer.performSearch(6117006, saveSearchName, 'robertson', true);
        });
        await test.step('View saved job.', async () => {
            await jobViewer.viewSaveJob(jobIdent, saveSearchName);
        });
        await test.step('Change sort order', async () => {
            await jobViewer.changeSortOrder(saveSearchName, jobIdent);
        });
        await test.step('View saved job.', async () => {
            await jobViewer.viewSaveJob(jobIdent, saveSearchName);
        });
    });


    test('Job Tab Clicks', async ({page}) => {
        var job = {
            id: 6113332,
            resource: 'robertson',
            ident: 'robertson-6113332'
        };
        var saveSearchName = 'AUTOTEST ' + new Date();
        const jobViewer = new JobViewerPage(page, baseUrl);
        const selectors = jobViewer.selectors;

        await test.step('Click the search button', async () => {
            await page.click(selectors.search.button);
        });
        await test.step('Perform a basic search', async () => {
            await jobViewer.performSearch(job.id, saveSearchName, job.resource, true);
        });

        await test.step('View saved job timeseries.', async () => {
            await jobViewer.viewSavedJobTimeseries(saveSearchName, job.ident, 'CPU User', 'Timeseries', 'cpn-k13-23-02', 'tsid_cpuuser');
        });
    });


    test('Edit Search', async ({page}) => {
        var resource = 'robertson';
        var startDate = '2016-12-22';
        var endDate = '2017-01-01';
        var criteriaName = 'Application';
        var criteriaValue = 'enzo';
        var jobId = 6117153;
        var nextJobId = 6118004;
        var searchNameBasic = 'AUTOTEST-QUICK' + new Date();

        const jobViewer = new JobViewerPage(page, baseUrl);
        const selectors = jobViewer.selectors;

        await test.step("Testing 'edit search' on a Quick Lookup Search ", async () => {
            await test.step('Create a Quick Lookup Search', async () => {
                await test.step('Click the search button', async () => {
                    await page.click(selectors.search.button);
                }); // Click the search button

                await test.step('Perform a Quick Lookup', async () => {
                    await jobViewer.performSearch(jobId, searchNameBasic, resource, true);
                }); // Perform a basic search
            }); // Create a Basic Search

            await test.step("Perform 'Edit' action on newly created Quick Lookup", async () => {
                await test.step("Perform 'Edit Search' Action", async () => {
                    await jobViewer.performEditSearch(searchNameBasic);
                }); // Perform 'Edit Search' Action

                await test.step('Validate that the search parameters have been set correctly.', async () => {
                    await jobViewer.validateSearchParameters(resource, jobId, false);
                }); // Validate that the search parameters have been set correctly.

                await test.step('Change the Job Number', async () => {
                    await jobViewer.changeJobNumber(nextJobId);
                }); // Change the Job Number

                await test.step("Perform 'Edit Search' Action Again", async () => {
                    await page.click(selectors.history.tree.searchnode(searchNameBasic));
                    await expect(page.locator(selectors.history.search.contextMenu.container)).toBeVisible();
                    await page.click(selectors.history.search.contextMenu.buttons.editSearch);
                }); // Perform 'Edit Search' Action

                await test.step('Validate that the search parameters have been set correctly.', async () => {
                    await jobViewer.validateSearchParameters(resource, nextJobId);
                }); // Validate that the search parameters have been set correctly.
            }); // Perform 'Edit Search' action on newly created Basic Search.

            await test.step('Delete Basic search', async () => {
                await test.step('Perform Delete', async () => {
                    await page.click(selectors.history.tree.searchnode(searchNameBasic));
                    await jobViewer.performDelete(searchNameBasic, false);
                    await jobViewer.clickLogoAndWaitForMask();
                }); // Perform Delete
            }); // Delete Basic Search
        }); // Testing 'edit search' on a Basic Search

        await test.step("Testing 'edit search' on an Advanced Search", async () => {
            var searchNameAdvanced = 'AUTOTEST-ADV' + new Date();

            await test.step('Create Advanced Search', async () => {
                await test.step('Click the search button', async () => {
                    await page.click(selectors.search.button);
                }); // Click the search button

                await test.step('Fill in Advanced Search Parameters', async () => {
                    await jobViewer.fillInAdvancedSearch(startDate, endDate, searchNameAdvanced, criteriaName, criteriaValue);
                }); // Fill in Advanced Search Parameters

                await test.step('Save Advanced Search Parameters', async () => {
                    await jobViewer.saveSearch();
                    await jobViewer.clickLogoAndWaitForMask();
                }); // Save Advanced Search Parameters
            }); // Create Advanced Search


            await test.step('Edit the newly created Advanced Search', async () => {
                await test.step("Perform the 'Edit Search' action", async () => {
                    await jobViewer.performEditSearch(searchNameAdvanced);
                }); // Perform the 'Edit Search' action
                await test.step('Validate that the search criteria was set correctly', async () => {
                    await expect(page.locator('//div[@id="job-viewer-search-criteria-grid"]//div[contains(text(),"Application")]')).toBeVisible();
                    await expect(page.locator('//div[@id="job-viewer-search-criteria-grid"]//div[contains(text(),"enzo")]')).toBeVisible();
                    await jobViewer.validateSearchDates(startDate, endDate);
                });
                await test.step('Validate that we have the correct number of results set', async () => {
                    await page.click('#job-viewer-search-search button');
                    const searchResults = page.locator(selectors.search.results.all);
                    await expect(searchResults).toBeVisible();
                    const count = await searchResults.count();
                    expect(count).toEqual(5);
                });

                await test.step('Change the selected records', async () => {
                    await jobViewer.changeSelectedRecords();
                });
            }); // Edit the newly created Advanced Search

            await test.step('Delete the Advanced Search', async () => {
                await test.step('Perform Delete Action', async () => {
                    await page.click(selectors.history.tree.searchnode(searchNameAdvanced));
                    await jobViewer.performDelete(searchNameAdvanced, false);
                    await jobViewer.clickLogoAndWaitForMask();
                });
            });
        }); // Create an Advanced Search

        await test.step('Edit a Metric Explorer Search', async () => {
            var tabId;
            var chartTitle = 'Job Viewer ' + new Date();
            await test.step('Click the Metric Explorer Tab', async () => {
                xdmodPage.selectTab('metric_explorer');
                me.waitForLoaded();
            }); // Click the Metric Explorer Tab
            await test.step('Create a metric explorer chart with SUPReMM data', async () => {
                me.createNewChart(chartTitle, 'Timeseries', 'Line');
                me.setDateRange('2016-12-30', '2017-01-01');
                me.addDataViaCatalog('SUPREMM', 'CPU Hours: Total', 'Resource');
                me.waitUntilChartLoadsBySeries('CPU Hours: Total');
            });
            await test.step('Click the first data point for the first data series', async () => {
                me.clickFirstDataPoint();
            });
            await test.step("Open 'Show Raw Data' Window", async () => {
                // @ts-ignore
                await expect(page.locator(jobViewer.meselectors.contextMenuItemByText('Show raw data'))).toBeVisible();
                // @ts-ignore
                await page.click(jobViewer.meselectors.contextMenuItemByText('Show raw data'));
            });
            await test.step("Select an entry in the 'Show Raw Data' window", async () => {
                tabId = await jobViewer.selectEntryRawDataWindow();
                await expect(page.locator(selectors.info.tabByName(tabId))).toBeVisible();
            });
            await test.step("Verify that the 'Edit Search' action is disabled", async () => {
                await jobViewer.verifyEditSearchIsDisabled(chartTitle);
            }); // Perform 'Edit Search' Action

            await test.step('Delete the Metric Explorer Search', async () => {
                await test.step('Perform Delete Action', async () => {
                    await jobViewer.performDelete(chartTitle, false);
                    await jobViewer.clickLogoAndWaitForMask();
                });
            });
        }); // Edit a Metric Explorer Search
    }); // Edit Search

    test('Delete all Searches', async ({page}) => {
        const jobViewer = new JobViewerPage(page, baseUrl);
        await test.step('Delete all search', async () => {
            await jobViewer.deleteAllSearches();
        });
    });

    test('Save coverage report', async ({page}) => {
        await test.step('Get the report and save', async () => {
            // fs.writeFileSync('coverage.json', browser.execute('return JSON.stringify(window.__coverage__, null, 4);').value);
        });
    });
    await LoginPage.logout();
});
