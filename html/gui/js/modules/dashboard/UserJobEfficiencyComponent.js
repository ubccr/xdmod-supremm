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
                            chart: {
                                plotBackgroundColor: null,
                                plotBorderWidth: 0,
                                plotShadow: false,
                                margin: [0, 0, 0, 0],
                                spacing: [0, 0, 0, 0],
                                width: 315,
                                height: 175
                            },
                            title: {
                                align: 'center',
                                verticalAlign: 'middle',
                                y: 30
                            },
                            tooltip: {
                                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                            },
                            plotOptions: {
                                pie: {
                                    startAngle: -90,
                                    endAngle: 90,
                                    center: ['50%', '100%'],
                                    size: '200%',
                                    sliceOffset: 0,
                                    dataLabels: {
                                        enabled: false
                                    }
                                }
                            },
                            series: [{
                                type: 'pie',
                                innerSize: '60%',
                                data: [{
                                    name: 'Efficient',
                                    color: 'green'
                                },
                                {
                                    name: 'Inefficient',
                                    color: 'red'
                                }]
                            }]
                        };

                        chartsToMake.forEach(function (value, index) {
                            chart_details.chart.renderTo = value.renderToDivId;
                            chart_details.title.text = value.chartTitle;
                            chart_details.series[0].name = value.seriesLabel;
                            chart_details.series[0].data[0].y = value.numberGoodDataValue;
                            chart_details.series[0].data[1].y = value.numberBadDataValue;

                            this.charts[index] = new Highcharts.Chart(chart_details);
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
