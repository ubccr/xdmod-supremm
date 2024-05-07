/**
 * XDMoD.Module.Dashboard.UserJobEfficiencyComponent
 *
 */

Ext.namespace('XDMoD.Module.Dashboard');

XDMoD.Module.Dashboard.UserJobEfficiencyComponent = Ext.extend(CCR.xdmod.ui.Portlet, {

    layout: 'fit',
    title: 'Job Efficiency Report',
    cls: 'user-efficiency-component',
    tpl: new Ext.XTemplate(
        "<div class='user-efficiency-data-row'>",
        "<div id='user-efficiency-job-ratio-chart'></div>",
        "<div class='user-efficiency-details'><div class='user-job-efficiency-component-job-count user-efficiency-detail'><h2>Total Job Count</h2>{job_count}</div>",
        "<div id='user-efficiency-component-inefficient-count' class='user-efficiency-detail'><h2>Inefficient Job Count</h2>{job_count_bad}</div></div>",
        '</div>',
        "<div class='user-efficiency-data-row'>",
        "<div id='user-efficiency-core-ratio-chart'></div>",
        "<div class='user-efficiency-details'><div class='user-core-efficiency-component-core-time user-efficiency-detail'><h2>Total Core Hours</h2>{core_time}</div>",
        "<div id='user-efficiency-component-inefficient-count' class='user-efficiency-detail'><h2>Inefficient Core Hours</h2>{core_time_bad}</div></div>",
        '</div>'
    ),
    charts: [],
    initComponent: function () {
        this.height = this.width * (11.0 / 17.0);

        this.help = {
            title: this.title,
            html: '<img src="/gui/images/help/userjobefficiency-component.svg" />'
        };

        var dateRanges = CCR.xdmod.ui.DurationToolbar.getDateRanges();

        var timeframe = this.config.timeframe ? this.config.timeframe : '30 day';

        var date = dateRanges.find(function (element) {
            return element.text === timeframe;
        }, this);

        this.setTitle(this.title + ' - ' + date.start.format('Y-m-d') + ' to ' + date.end.format('Y-m-d'));

        this.jobStore = new Ext.data.JsonStore({
            restful: true,
            url: XDMoD.REST.url + '/warehouse/aggregatedata',
            root: 'results',
            autoLoad: true,
            baseParams: {
                start: 0,
                limit: 1,
                config: JSON.stringify({
                    realm: 'JobEfficiency',
                    group_by: 'person',
                    aggregation_unit: 'day',
                    start_date: date.start.format('Y-m-d'),
                    end_date: date.end.format('Y-m-d'),
                    person_id: CCR.xdmod.ui.mappedPID,
                    order_by: {
                        field: 'core_time_bad',
                        dirn: 'desc'
                    },
                    statistics: ['core_time', 'core_time_bad', 'bad_core_ratio', 'job_count', 'job_count_bad', 'bad_job_ratio']
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
            },
            {
                name: 'bad_job_ratio',
                type: 'float'
            },
            {
                name: 'core_time',
                type: 'float'
            },
            {
                name: 'job_count',
                type: 'float'
            },
            {
                name: 'job_count_bad',
                type: 'float'
            }],
            listeners: {
                load: function (store, records, options) {
                    if (records.length > 0) {
                        var data = records[0].data;

                        data.core_time = Math.round(data.core_time * 100) / 100;
                        data.core_time_bad = Math.round(data.core_time_bad * 100) / 100;

                        this.update(data);

                        var chartsToMake = [{
                            renderToDivId: 'user-efficiency-core-ratio-chart',
                            chartTitle: 'Core Hour<br />Efficiency',
                            seriesLabel: 'Core Hour Efficiency',
                            totalDataValue: data.core_time,
                            numberGoodDataValue: data.core_time - data.core_time_bad,
                            numberBadDataValue: data.core_time_bad
                        },
                        {
                            renderToDivId: 'user-efficiency-job-ratio-chart',
                            chartTitle: 'Job<br />Efficiency',
                            seriesLabel: 'Job Efficiency',
                            totalDataValue: data.job_count,
                            numberGoodDataValue: data.job_count - data.job_count_bad,
                            numberBadDataValue: data.job_count_bad
                        }];

                        var chart_details = {
                            exporting: {
                                enabled: false
                            },
                            credits: '',
                            layout: {
                                width: 315,
                                height: 175,
                                margin: {
                                    t: 5,
                                    b: 0,
                                    l: 0,
                                    r: 0
                                },
                                annotations: [{
                                    name: 'title',
                                    text: '',
                                    xref: 'paper',
                                    yref: 'paper',
                                    xanchor: 'center',
                                    yanchor: 'bottom',
                                    x: 0.5,
                                    y: 0.25,
                                    font: {
                                        color: '#000000',
                                        family: 'Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif'
                                    },
                                    showarrow: false,
                                    captureevents: false
                                }],
                                hoverlabel: {
                                    align: 'left',
                                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                                    font: {
                                        size: 12.8,
                                        color: '#333333',
                                        family: 'Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif'
                                    },
                                    namelength: -1
                                },
                                domain: {
                                    x: [0, 4.0]
                                }
                            },
                            data: [{
                                showlegend: false,
                                type: 'pie',
                                marker: {
                                    colors: ['green', 'red', 'white']
                                },
                                line: {
                                    width: 0
                                },
                                textposition: 'none',
                                textfont: {
                                    color: '#000000',
                                    family: 'Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif'
                                },
                                text: null,
                                hovertemplate: '%{label} <br> %{text}: %{value} <extra></extra>',
                                sort: false,
                                direction: 'clockwise',
                                hole: 0.35,
                                rotation: -90,
                                labels: ['Efficient', 'Inefficient', 'hidden'],
                                values: [null, null, null]
                            }]
                        };

                        chartsToMake.forEach(function (value, index) {
                            chart_details.renderTo = value.renderToDivId;
                            chart_details.layout.annotations[0].text = value.chartTitle;
                            chart_details.data[0].name = value.seriesLabel;
                            chart_details.data[0].values[0] = value.numberGoodDataValue;
                            chart_details.data[0].values[1] = value.numberBadDataValue;
                            const sum = value.numberGoodDataValue + value.numberBadDataValue;
                            chart_details.data[0].values[2] = sum;
                            chart_details.data[0].hovertemplate = [`Efficient<br>${value.seriesLabel}: <b>${Number.parseFloat((value.numberGoodDataValue / sum) * 100).toFixed(2)}%</b><extra></extra>`,
                                                                   `Inefficient<br>${value.seriesLabel}: <b>${Number.parseFloat((value.numberBadDataValue / sum) * 100).toFixed(2)}%</b><extra></extra>`,
                                                                   '<extra></extra>'];
                            this.charts[index] = XDMoD.utils.createChart(chart_details);

                            const chartDiv = document.getElementById(chart_details.renderTo);
                            chartDiv.on('plotly_click', (evt) => {
                                if (evt.points[0].label === 'hidden') {
                                    return;
                                }
                                var title = 'Jobs categorized as ' + evt.points[0].label;
                                var searchParams = {
                                    person: CCR.xdmod.ui.mappedPID,
                                    category: 2
                                };
                                if (evt.points[0].label === 'Efficient') {
                                    searchParams.category = [-1, 1];
                                }
                                var rawdataWindow = new Ext.Window({
                                    height: 530,
                                    width: 480,
                                    closable: true,
                                    modal: true,
                                    title: title,
                                    layout: 'fit',
                                    autoScroll: true,
                                    items: [{
                                        xtype: 'xdmod-jobgrid',
                                        height: 500,
                                        config: {
                                            realm: 'JobEfficiency',
                                            job_viewer_realm: 'SUPREMM',
                                            start_date: date.start.format('Y-m-d'),
                                            end_date: date.end.format('Y-m-d'),
                                            params: searchParams,
                                            multiuser: false,
                                            page_size: 15,
                                            row_click_callback: function () {
                                                rawdataWindow.destroy();
                                            }
                                        }
                                    }]
                                });
                                rawdataWindow.show();
                            });
                        }, this);
                    } else {
                        var emptyTpl = new Ext.XTemplate('<div class="x-grid-empty"><div class="no-data-alert">No Job Efficiency Data Found</div><div class="no-data-info">Job information only shows in XDMoD once the job has finished and there is a short delay between a job finishing and the job&apos;s data being available in XDMoD.</div></div>');
                        this.tpl = emptyTpl;
                        this.update();
                    }
                }.bind(this)
            }
        });

        XDMoD.Module.Dashboard.UserJobEfficiencyComponent.superclass.initComponent.apply(this, arguments);
    }
});

Ext.reg('xdmod-dash-userjobeff-cmp', XDMoD.Module.Dashboard.UserJobEfficiencyComponent);
