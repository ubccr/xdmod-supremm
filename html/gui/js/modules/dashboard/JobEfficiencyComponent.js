/**
 * XDMoD.Module.Dashboard.JobEfficiencyComponent
 *
 */

Ext.namespace('XDMoD.Module.Dashboard');

XDMoD.Module.Dashboard.JobEfficiencyComponent = Ext.extend(Ext.ux.Portlet, {

    layout: 'fit',
    title: 'Job Efficiency Dashboard',

    initComponent: function () {
        this.height = this.width * (11.0 / 17.0);

        var DEFAULT_PAGE_SIZE = 12;

        if (this.config.multiuser) {
            // multiuser view has an extra toolbar at the top
            DEFAULT_PAGE_SIZE -= 1;
        }

        var maxCoreTime = -1;

        var bar2plot = function (value, mdata) {
            var width = Math.ceil(value);
            mdata.attr = 'ext:qtip="' + Ext.util.Format.number(value, '00.0') + ' % of CPU Core Hours"';

            var left = '<div style="float: left; width: ' + width + 'px; height: 15px; border-right: thin solid black; background-color: #cc0a0c"> </div>';
            var right = '<div style="float: left; width: ' + (100 - width) + 'px; height: 15px; background-color: #4CAF50;"></div>';

            return left + right;
        };

        var barPlot = function (value, mdata, record) {
            if (maxCoreTime === -1) {
                var maxVal = record.store.getAt(0);
                maxCoreTime = maxVal.get('core_time_bad');
            }

            mdata.attr = 'ext:qtip="' + Ext.util.Format.number(value, '0,000') + ' CPU Core Hours"';

            var width = Math.ceil(100 * (record.get('core_time_bad') / maxCoreTime));
            return '<div style="width: ' + width + 'px; height: 15px; background-color: #1199ff; margin-right: 5px; float: left"></div><div>' + XDMoD.utils.format.convertToSiPrefix(value, '', 2) + '</div>';
        };

        // Sync date ranges
        var dateRanges = CCR.xdmod.ui.DurationToolbar.getDateRanges();

        var timeframe = this.config.timeframe ? this.config.timeframe : '30 day';

        var date = dateRanges.find(function (element) {
            return element.text === timeframe;
        }, this);

        var start_datestr = date.start.format('Y-m-d');
        var end_datestr = date.end.format('Y-m-d');

        this.title += ' - ' + start_datestr + ' to ' + end_datestr;

        var jobStore = new Ext.data.JsonStore({
            restful: true,
            url: XDMoD.REST.url + '/warehouse/aggregatedata',
            root: 'results',
            autoLoad: true,
            baseParams: {
                start: 0,
                limit: DEFAULT_PAGE_SIZE,
                config: JSON.stringify({
                    realm: 'JobEfficiency',
                    group_by: 'person',
                    aggregation_unit: 'day',
                    start_date: start_datestr,
                    end_date: end_datestr,
                    order_by: {
                        field: 'core_time_bad',
                        dirn: 'desc'
                    },
                    statistics: ['core_time_bad', 'bad_core_ratio']
                })
            },
            fields: [{
                name: 'name',
                type: 'string'
            }, {
                name: 'core_time_bad',
                type: 'float'
            }, {
                name: 'bad_core_ratio',
                type: 'float'
            }],
            listeners: {
                update_groupby: function (group_by) {
                    var config = JSON.parse(this.baseParams.config);
                    config.group_by = group_by;
                    this.baseParams.config = JSON.stringify(config);
                    maxCoreTime = -1;

                    jobStore.load();
                }
            }
        });

        this.items = [{
            xtype: 'grid',
            region: 'center',
            frame: true,
            store: jobStore,
            loadMask: true,
            colModel: new Ext.grid.ColumnModel({
                defaults: {
                    sortable: true
                },
                columns: [{
                    header: 'Name',
                    width: 250,
                    sortable: true,
                    dataIndex: 'name'
                }, {
                    header: 'Inefficient Core Hours',
                    width: 170,
                    renderer: barPlot,
                    sortable: true,
                    dataIndex: 'core_time_bad'
                }, {
                    header: 'Inefficient / Efficient',
                    width: 120,
                    sortable: true,
                    renderer: bar2plot,
                    dataIndex: 'bad_core_ratio'
                }]
            }),
            viewConfig: {
                deferEmptyText: true,
                emptyText: '<div class="no-data-alert">No Job Efficiency Data Found</div><div class="no-data-info">Job information only shows in XDMoD once the job has finished and there is a short delay between a job finishing and the job&apos;s data being available in XDMoD.</div>'
            },
            bbar: new Ext.PagingToolbar({
                store: jobStore,
                displayInfo: true,
                pageSize: DEFAULT_PAGE_SIZE,
                prependButtons: true
            }),
            sm: new Ext.grid.RowSelectionModel({
                singleSelect: true
            })
        }];

        if (this.config.multiuser) {
            this.items[0].tbar = {
                items: [{
                    xtype: 'tbtext',
                    text: 'Group By:',
                    style: 'padding: 0 2px'
                },
                {
                    text: 'Person',
                    menu: {
                        items: [
                            {
                                xtype: 'menucheckitem',
                                group: 'group_by',
                                checked: true,
                                text: 'Person',
                                listeners: {
                                    click: function () {
                                        jobStore.fireEvent('update_groupby', 'person');
                                        this.findParentByType('button').setText('Person');
                                    }
                                }
                            },
                            {
                                xtype: 'menucheckitem',
                                group: 'group_by',
                                text: 'PI',
                                listeners: {
                                    click: function () {
                                        jobStore.fireEvent('update_groupby', 'pi');
                                        this.findParentByType('button').setText('PI');
                                    }
                                }
                            }
                        ]
                    }
                }]
            };
        }
        XDMoD.Module.Dashboard.JobEfficiencyComponent.superclass.initComponent.apply(this, arguments);
    }
});

Ext.reg('xdmod-dash-jobeff-cmp', XDMoD.Module.Dashboard.JobEfficiencyComponent);
