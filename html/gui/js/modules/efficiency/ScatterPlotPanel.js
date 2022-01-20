Ext.namespace('XDMoD', 'XDMoD.Module', 'XDMoD.Module.Efficiency');

/**
 * @class XDMoD.Module.Efficiency.ScatterPlotPanel
 */

XDMoD.Module.Efficiency.ScatterPlotPanel = Ext.extend(Ext.Panel, {
    chart: null,
    store: null,
    img: null,
    aggFilters: null,
    MEFilters: null,
    jobListFilters: null,
    subtitle: 'No filters applied.',

    initComponent: function () {
        var self = this;

        // Create new scatter plot chart
        var createChart = function () {
            var defaultChartSettings = {
                chart: {
                    renderTo: self.id + 'ScatterPlot',
                    type: 'scatter',
                    zoomType: 'xy'
                },
                colors: ['#2f7ed8', '#0d233a', '#8bbc21', '#910000', '#1aadce', '#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a'],
                title:
                {
                    x: 130,
                    style: {
                        color: '#444b6e',
                        fontSize: 20
                    },
                    text: self.config.analytic
                },
                subtitle: {
                    x: 130
                },
                loading: {
                    style: {
                        opacity: 0.7
                    }
                },
                legend: {
                    enabled: false
                },
                exporting: {
                    enabled: false
                },
                tooltip: {
                    formatter: function () {
                        if (this.point.person) {
                            return '<b>' + this.point.person + '</b><br>' + self.config.statisticLabels[0] + ': <b>' + this.point.x.toFixed(0) + ' ' + self.config.valueLabels[0] + '</b><br>' + self.config.statisticLabels[1] + ': <b>' + this.point.y.toFixed(0) + ' ' + self.config.valueLabels[1] + '</b>';
                        }
                        return 'User (Access denied to view name) <br>' + self.config.statisticLabels[0] + ': <b>' + this.point.x.toFixed(0) + ' ' + self.config.valueLabels[0] + '</b><br>' + self.config.statisticLabels[1] + ': <b>' + this.point.y.toFixed(0) + ' ' + self.config.valueLabels[1] + '</b>';
                    },
                    positioner: function (labelWidth, labelHeight, point) {
                        var tooltipX;
                        var tooltipY;
                        if (point.plotX < self.chart.plotWidth / 2) {
                            tooltipX = point.plotX + 300;
                        } else if (point.plotX > 50) {
                            tooltipX = point.plotX - 50;
                        }

                        tooltipY = point.plotY + 25;
                        return {
                            x: tooltipX,
                            y: tooltipY
                        };
                    }
                },
                plotOptions: {
                    series: {
                        turboThreshold: 3000,
                        animation: false,
                        point: {
                            events: {
                                click: function (e) {
                                    // Show drilldown histogram when user clicks on point
                                    if (e.point.series.options.clickable) {
                                        // Add new breadcrumb for drilldown view
                                        var breadcrumbMenu = Ext.getCmp('breadcrumb_btns');

                                        var btn = {
                                            xtype: 'button',
                                            text: self.config.analytic + ' for ' + e.point.person,
                                            disabled: true,
                                            iconCls: 'chart'
                                        };

                                        breadcrumbMenu.add({ xtype: 'tbtext', text: '&#10142' });
                                        breadcrumbMenu.add(btn);
                                        breadcrumbMenu.doLayout();

                                        // Enable scatter plot breadcrumb for navigation
                                        var analyticBtn = Ext.getCmp(self.config.analytic + '_breadcrumb_btn');
                                        analyticBtn.enable();

                                        // Load the drilldown on person chart
                                        self.getPersonChart(e.point.person, e.point.personId);
                                    }
                                }
                            }
                        }

                    }
                },
                xAxis: [
                    {
                        title: {
                            text: self.config.statisticLabels[0]
                        },
                        reversed: self.config.reversed,
                        min: 0,
                        max: 100,
                        tickInterval: 100 / 4,
                        tickLength: 0,
                        gridLineWidth: 1,
                        showLastLabel: true,
                        showFirstLabel: true,
                        lineColor: '#ccc',
                        lineWidth: 1,
                        plotLines: [{
                            color: 'black',
                            dashStyle: 'solid',
                            value: 100 / 2,
                            width: 2
                        }]
                    },
                    {
                        lineWidth: 0,
                        minorGridLineWidth: 0,
                        labels: {
                            enabled: false
                        },
                        minorTickLength: 0,
                        tickLength: 0,
                        title: {
                            useHTML: true,
                            text: "<img src='gui/images/right_arrow.png' style='width: " + 0 + "px; height: 100px;' />",
                            align: 'middle'
                        }
                    },
                    {
                        lineWidth: 0,
                        minorGridLineWidth: 0,
                        labels: {
                            enabled: false
                        },
                        minorTickLength: 0,
                        tickLength: 0,
                        title: {
                            text: 'LESS EFFICIENT',
                            align: 'middle',
                            offset: -25,
                            style: {
                                fontSize: 20
                            }
                        }
                    }],
                yAxis: [
                    {
                        title: {
                            text: self.config.statisticLabels[1]
                        },
                        labels: {
                            format: '{value:.0f}'
                        }
                    },
                    {
                        title: {
                            useHTML: true,
                            text: "<img src='gui/images/right_arrow.png' style='height: 100px; width: " + 0 + "px;'/>",
                            align: 'middle',
                            offset: 75
                        }
                    },
                    {
                        title: {
                            text: 'MORE USAGE',
                            align: 'middle',
                            offset: -100,
                            style: {
                                fontSize: 20
                            }
                        }
                    }
                ],
                credits: {
                    text: Ext.getCmp('efficiency').getDurationSelector().getStartDate().format('Y-m-d') + ' to ' + Ext.getCmp('efficiency').getDurationSelector().getEndDate().format('Y-m-d') + ' Powered by XDMoD/Highcharts',
                    href: ''
                }

            };

            var chartOptions = jQuery.extend(true, {}, defaultChartSettings, self.chartSettings);

            self.chart = new Highcharts.Chart(chartOptions);
        };

        var storeSettings = {
            proxy: new Ext.data.HttpProxy({
                method: 'GET',
                url: this.panelSettings.url,
                listeners: {
                    exception: function (proxy, type, action, options, response) {
                        while (self.chart.series.length > 0) {
                            self.chart.series[0].remove(true);
                        }
                        var text = self.chart.renderer.text('ERROR ' + response.status + ' ' + response.statusText, self.chart.plotLeft + 23, self.chart.plotTop + 10).add();
                        var box = text.getBBox();
                        self.chart.renderer.image('/gui/images/about_16.png', box.x - 23, box.y - 1, 16, 16).add();
                        self.chart.hideLoading();
                        self.chart.redraw();
                    }
                }
            }),
            baseParams: this.panelSettings.baseParams,
            autoLoad: false,
            root: 'results',
            fields: [
                self.config.statistics[0],
                self.config.statistics[1],
                'name'
            ],
            listeners: {
                beforeload: function () {
                    self.chart.showLoading();
                },
                load: function (inst) {
                    if (self.chart) {
                        self.chart.destroy();
                    }
                    createChart();

                    self.chart.setTitle(null, { text: self.subtitle });
                    var xStatistic;
                    var yStatistic;
                    // Get the statistics that will be shown in the scatter plot - since scatter plot uses job_count statistic for both, need to specify short_job_count for x axis
                    if (self.config.analytic === 'Short Job Count') {
                        xStatistic = 'short_' + self.config.statistics[0];
                        yStatistic = self.config.statistics[1];
                    } else {
                        xStatistic = self.config.statistics[0];
                        yStatistic = self.config.statistics[1];
                    }

                    var resultData = this.data.items[0].json.results;
                    var generalData = this.data.items[0].json.hiddenData;

                    if (resultData.length > 0 || generalData.length > 0) {
                        // Remove no data available image
                        if (self.img) {
                            self.img.destroy();
                            self.img = null;
                        }

                        var dataset;
                        var generalSeriesData;
                        var generalXMax;
                        var generalYMax;
                        var resultSeriesData;
                        var resultXMax;
                        var resultYMax;
                        var xAxisMax;
                        var yAxisMax;
                        var reversed = self.config.reversed;

                        if (resultData.length > 0 && generalData.length > 0) {
                            // Get the general data series without name information and the x and y axis max from this dataset
                            dataset = self.formatData(generalData, xStatistic, yStatistic, reversed);
                            generalSeriesData = dataset[0];
                            generalXMax = dataset[1];
                            generalYMax = dataset[2];

                            // Get the result data series with name information
                            dataset = self.formatData(resultData, xStatistic, yStatistic, reversed);
                            resultSeriesData = dataset[0];
                            resultXMax = dataset[1];
                            resultYMax = dataset[2];

                            xAxisMax = Math.max(generalXMax, resultXMax);
                            yAxisMax = Math.max(generalYMax, resultYMax);

                            self.chart.addSeries({
                                data: generalSeriesData
                            });

                            self.chart.addSeries({
                                data: resultSeriesData,
                                clickable: true,
                                dataLabels: {
                                    enabled: true,
                                    align: 'left',
                                    format: '{point.person}',
                                    y: -10
                                },
                                marker: {
                                    fillColor: 'transparent',
                                    symbol: 'circle',
                                    radius: 10,
                                    lineWidth: 2,
                                    lineColor: 'black'
                                }
                            });
                        } else if (generalData.length > 0) {
                            dataset = self.formatData(generalData, xStatistic, yStatistic, reversed);
                            generalSeriesData = dataset[0];
                            xAxisMax = dataset[1];
                            yAxisMax = dataset[2];

                            self.chart.addSeries({
                                data: generalSeriesData
                            });
                        } else if (resultData.length > 0) {
                            // If no restrictions in place, get data with general data set formatting (blue and red points indicating efficiency)
                            // Get the general data series with name information and x and y axis max
                            dataset = self.formatData(resultData, xStatistic, yStatistic, reversed);
                            resultSeriesData = dataset[0];
                            xAxisMax = dataset[1];
                            yAxisMax = dataset[2];

                            self.chart.addSeries({
                                data: resultSeriesData,
                                clickable: true
                            });
                        }

                        // Update x and y axis to reflect the max and min
                        self.chart.yAxis[0].update({
                            min: 0,
                            max: yAxisMax,
                            tickInterval: Math.ceil(yAxisMax) / 4,
                            plotLines: [{
                                color: 'black',
                                dashStyle: 'solid',
                                value: Math.ceil(yAxisMax) / 2,
                                width: 2
                            }]
                        });

                        self.chart.xAxis[0].update({
                            min: 0,
                            max: xAxisMax,
                            tickInterval: Math.ceil(xAxisMax) / 4,
                            plotLines: [{
                                color: 'black',
                                dashStyle: 'solid',
                                value: Math.ceil(xAxisMax) / 2,
                                width: 2
                            }]
                        });

                        // Update arrow size based on chart size
                        self.chart.xAxis[1].update({
                            title: {
                                text: "<img src='gui/images/right_arrow.png' style='width: " + (self.chart.chartWidth * (2 / 3)) + "px; height: 100px;' />"
                            }
                        });

                        self.chart.yAxis[1].update({
                            title: {
                                text: "<img src='gui/images/right_arrow.png' style='width: " + (self.chart.chartHeight * (2 / 3)) + "px; height: 100px;' />"
                            }
                        });

                        self.chart.redraw();
                        self.chart.hideLoading();
                    } else {
                        self.chart.destroy();
                        createChart();
                        self.chart.setTitle(null, { text: self.subtitle });
                        self.img = self.chart.renderer.image('gui/images/report_thumbnail_no_data.png', (self.chart.chartWidth - 400) * (2 / 3), (self.chart.chartHeight - 300) / 2, 400, 300).add();
                    }

                    // Update the description panel to reflect the current statistics
                    var descriptionPanel = Ext.getCmp('descriptionPanel');
                    var commentsTemplate = new Ext.XTemplate(
                        '<table class="xd-table">',
                        '<tr>',
                        '<td width="100%">',
                        '<span class="comments_subnotes">{subnotes}</span>',
                        '</td>',
                        '</tr>',
                        '<tr>',
                        '<td width="100%">',
                        '<span class="comments_description">{comments}</span>',
                        '</td>',
                        '</tr>',
                        '</table>'
                    );

                    commentsTemplate.overwrite(descriptionPanel.body, {
                        comments: self.config.statisticDescription,
                        subnotes: ''
                    });

                    descriptionPanel.doLayout();
                }
            }
        };

        this.store = new Ext.data.JsonStore(storeSettings);

        this.layout = 'fit';
        this.items = [{
            xtype: 'container',
            id: this.id + 'ScatterPlot',
            listeners: {
                resize: function () {
                    if (self.chart) {
                        self.chart.reflow();
                        // Update arrow size based on new chart dimensions
                        self.chart.xAxis[1].update({
                            title: {
                                text: "<img src='gui/images/right_arrow.png' style='width: " + (self.chart.chartWidth * (2 / 3)) + "px; height: 100px;' />"
                            }
                        });
                        self.chart.yAxis[1].update({
                            title: {
                                text: "<img src='gui/images/right_arrow.png' style='width: " + (self.chart.chartHeight * (2 / 3)) + "px; height: 100px;' />"
                            }
                        });
                    }
                },
                render: function () {
                    createChart();
                    self.store.load();
                }
            }
        }];

        XDMoD.Module.Efficiency.ScatterPlotPanel.superclass.initComponent.call(this, arguments);
    },

    formatData: function (dataset, xStatistic, yStatistic, reversed) {
        var data = [];

        var xAxisMax = this.getMax(dataset, xStatistic);
        if (xAxisMax < 100) {
            xAxisMax = 100;
        }
        var yAxisMax = this.getMax(dataset, yStatistic);

        for (var i = 0; i < dataset.length; i++) {
            var x = parseFloat(dataset[i][xStatistic]);
            var y = parseFloat(dataset[i][yStatistic]);
            var person = dataset[i].name || null;
            var personId = dataset[i].id || null;

            var color;
            if (reversed && (x < xAxisMax / 2 && y > yAxisMax / 2)) {
                color = '#ff0000';
            } else if (!reversed && (x > xAxisMax / 2 && y > yAxisMax / 2)) {
                color = '#ff0000';
            } else {
                color = '#2f7ed8';
            }

            var dataPt = { x: x, y: y, person: person, personId: personId, color: color };
            data.push(dataPt);
        }

        return [data, xAxisMax, yAxisMax];
    },

    getMax: function (record, property) {
        var max;
        for (var i = 0; i < record.length; i++) {
            if (parseFloat(record[i][property]) || parseFloat(record[i][property]) === 0) {
                if (!max || parseFloat(record[i][property]) > max) {
                    max = Math.ceil(parseFloat(record[i][property])) + 1;
                }
            }
        }
        return max;
    },

    mask: function (message) {
        var viewer = CCR.xdmod.ui.Viewer.getViewer();

        if (!viewer.el) {
            return;
        }

        viewer.el.mask(message);
    },

    unmask: function () {
        var viewer = CCR.xdmod.ui.Viewer.getViewer();

        if (!viewer.el) {
            return;
        }

        // If a mask is present, but the mask should not be removed,
        // just remove the message in the mask.
        if (viewer.el.isMasked() && CCR.xdmod.ui.Viewer.dontUnmask) {
            viewer.el.mask();
            return;
        }

        viewer.el.unmask();
    },

    getPersonChart: function (person, personId) {
        var self = this;

        // Person filter is not stored in MEFilters, so need to add prior to setting filters on chart
        var filterObj;
        if (self.MEFilters == null) {
            filterObj = {
                data: [
                    {
                        dimension_id: 'person',
                        id: 'person=' + personId,
                        realms: ['SUPREMM'],
                        value_id: personId,
                        value_name: person,
                        checked: true
                    }
                ],
                total: 1
            };
        } else {
            var filterData = self.MEFilters.slice();

            filterData.push({
                dimension_id: 'person',
                id: 'person=' + personId,
                realms: ['SUPREMM'],
                value_id: personId,
                value_name: person,
                checked: true
            });

            filterObj = {
                data: filterData,
                total: filterData.length
            };
        }

        var baseParams = {
            show_title: 'y',
            title: self.config.histogram.title + ' for ' + person,
            timeseries: false,
            aggregation_unit: 'day',
            start_date: Ext.getCmp('efficiency').getDurationSelector().getStartDate().format('Y-m-d'),
            end_date: Ext.getCmp('efficiency').getDurationSelector().getEndDate().format('Y-m-d'),
            global_filters: filterObj,
            show_filters: true,
            show_warnings: true,
            show_remainder: false,
            start: 0,
            limit: 200,
            timeframe_label: 'Previous month',
            operation: 'get_data',
            data_series: [{
                id: Math.random(),
                metric: self.config.histogram.metric,
                category: self.config.realm,
                realm: self.config.realm,
                group_by: self.config.histogram.group_by,
                x_axis: true,
                log_scale: false,
                has_std_err: false,
                std_err: false,
                value_labels: false,
                display_type: 'column',
                line_type: 'Solid',
                line_width: 2,
                combine_type: 'side',
                sort_type: 'none',
                filters: {
                    data: [],
                    total: 0
                },
                ignore_global: false,
                long_legend: false,
                trend_line: false,
                color: 'auto',
                shadow: false,
                visibility: 'null',
                z_index: 0,
                enabled: true
            }],
            swap_xy: false,
            share_y_axis: false,
            hide_tooltip: false,
            show_guide_lines: true,
            scale: 1,
            format: 'hc_jsonstore',
            legend_type: 'off',
            controller_module: 'metric_explorer'
        };

        baseParams.global_filters = encodeURIComponent(Ext.util.JSON.encode(baseParams.global_filters));
        baseParams.data_series = encodeURIComponent(Ext.util.JSON.encode(baseParams.data_series));


        // Add rotate class to arrow image if specified by histogram config
        var rotate = self.config.histogram.rotate;
        var cls;
        if (rotate) {
            cls = 'rotate90';
        } else {
            cls = '';
        }

        var chartStore = new CCR.xdmod.CustomJsonStore({
            id: 'histogram_chart_store_' + self.config.analytic,
            autoDestroy: false,
            autoLoad: true,
            root: 'data',
            totalProperty: 'totalCount',
            successProperty: 'success',
            messageProperty: 'message',
            fields: [
                'chart',
                'credits',
                'title',
                'subtitle',
                'xAxis',
                'yAxis',
                'tooltip',
                'legend',
                'series',
                'plotOptions',
                'alignedLabels',
                'credits',
                'dimensions',
                'metrics',
                'exporting',
                'reportGeneratorMeta'
            ],
            baseParams: baseParams,
            proxy: new Ext.data.HttpProxy({
                method: 'GET',
                url: XDMoD.REST.url + '/efficiency/histogram/' + self.config.histogram.group_by,
                listeners: {
                    exception: function (proxy, type, action, options, response) {
                        self.unmask();

                        var responseMessage = CCR.xdmod.ui.extractErrorMessageFromResponse(response);
                        if (responseMessage === null) {
                            responseMessage = 'Unknown Error';
                        }
                        Ext.getCmp('hc-panel-' + self.config.analytic).displayError(
                            'An error occurred while loading the chart.',
                            responseMessage
                        );
                    }
                }
            }),
            listeners: {
                beforeload: function (e) {
                    self.mask('Loading...');
                },
                load: function (e) {
                    var chartWidth = Ext.getCmp('hc-panel-' + self.config.analytic).chart.plotWidth;
                    var chartHeight = Ext.getCmp('hc-panel-' + self.config.analytic).chart.plotHeight;

                    var chartObj = e.data.items[0].data;
                    if (chartObj.series.length > 0) {
                        var series = chartObj.series[0].data;
                        var categories = [];
                        for (var i = 0; i < series.length; i++) {
                            var label = series[i].drilldown.label;
                            categories.push(label);
                        }

                        chartObj.xAxis = [
                            {
                                categories: categories,
                                title: {
                                    text: self.config.histogram.groupByTitle
                                }
                            },
                            {
                                lineWidth: 0,
                                minorGridLineWidth: 0,
                                labels: {
                                    enabled: false
                                },
                                minorTickLength: 0,
                                tickLength: 0,
                                title: {
                                    useHTML: true,
                                    text: "<img src='gui/images/right_arrow.png' class='" + cls + "' style='width: " + (chartWidth * (2 / 3)) + "px; height: 100px;' />",
                                    align: 'middle'
                                }
                            },
                            {
                                lineWidth: 0,
                                minorGridLineWidth: 0,
                                labels: {
                                    enabled: false
                                },
                                minorTickLength: 0,
                                tickLength: 0,
                                title: {
                                    text: 'LESS EFFICIENT',
                                    align: 'middle',
                                    offset: -25,
                                    style: {
                                        fontSize: 20
                                    }
                                }
                            }
                        ];

                        chartObj.yAxis = [
                            {
                                allowDecimals: false,
                                dtitle: 'yAxis0',
                                endOnTick: true,
                                gridLineWidth: 1,
                                labels: {
                                    style: { fontWeight: 'normal', fontSize: '11px' }
                                },
                                lineWidth: 2,
                                max: null,
                                maxPadding: 0.05,
                                min: 0,
                                opposite: false,
                                otitle: self.config.histogram.metricTitle,
                                showLastLabel: true,
                                startOnTick: true,
                                tickInterval: null,
                                title: { text: self.config.histogram.metricTitle, style: { color: '#1199ff', fontWeight: 'bold', fontSize: '12px' } },
                                type: 'linear'
                            },
                            {
                                title: {
                                    useHTML: true,
                                    text: "<img src='gui/images/right_arrow.png' style='width: " + (chartHeight * (2 / 3)) + "px; height: 100px;' />",
                                    align: 'middle',
                                    offset: 75
                                }
                            },
                            {
                                title: {
                                    text: 'MORE USAGE',
                                    align: 'middle',
                                    offset: -100,
                                    style: {
                                        fontSize: 20
                                    }
                                }
                            }
                        ];
                        self.updateDescription(chartStore);
                    }
                    self.unmask();
                }
            }
        });

        var personChart = new CCR.xdmod.ui.HighChartPanel({
            id: 'hc-panel-' + self.config.analytic,
            person: person,
            personId: personId,
            boxMinWidth: 800,
            boxMinHeight: 600,
            autoScroll: true,
            baseChartOptions: {
                plotOptions: {
                    series: {
                        events: {
                            click: function (e) {
                                var dataPoint = e.point.index;
                                var datasetId = e.point.series.userOptions.datasetId;
                                var drilldownId = e.point.drilldown.id;
                                var drilldownLabel = e.point.drilldown.label;
                                var jobGrid = Ext.getCmp('cpu_user_job_information');

                                if (jobGrid) {
                                    jobGrid.destroy();
                                }

                                self.getJobList(personId, person, dataPoint, datasetId, drilldownId, drilldownLabel);
                            }
                        }
                    }
                }
            },
            store: chartStore,
            listeners: {
                resize: function () {
                    if (personChart.chart.xAxis[1]) {
                        // Update arrow size based on new chart dimensions
                        personChart.chart.xAxis[1].update({
                            title: {
                                text: "<img src='gui/images/right_arrow.png' class='" + cls + "' style='width: " + (personChart.chart.plotWidth * (2 / 3)) + "px; height: 100px;' />"
                            }
                        });
                        personChart.chart.yAxis[1].update({
                            title: {
                                text: "<img src='gui/images/right_arrow.png' style='width: " + (personChart.chart.plotHeight * (2 / 3)) + "px; height: 100px;' />"
                            }
                        });
                    }
                }
            }
        });

        var analyticPanel = Ext.getCmp('detailed_analytic_panel_' + this.config.analytic);
        analyticPanel.add(personChart);
        analyticPanel.layout.setActiveItem(1);
        analyticPanel.doLayout();
    },

    updateDescription: function (chartStore) {
        var dimsDesc = '<ul>';
        var metricsDesc = '<ul>';
        if (chartStore !== null) {
            for (var i = 0; i < chartStore.getCount(); i++) {
                var md = chartStore.getAt(i).get('dimensions');
                for (var d in md) {
                    if (md.hasOwnProperty(d)) {
                        dimsDesc += '<li><b>' + d + ':</b> ' + md[d] + '</li>\n';
                    }
                }
            }
            for (var k = 0; k < chartStore.getCount(); k++) {
                var md2 = chartStore.getAt(k).get('metrics');
                for (var e in md2) {
                    if (md2.hasOwnProperty(e)) {
                        metricsDesc += '<li><b>' + e + ':</b> ' + md2[e] + '</li>\n';
                    }
                }
            }
        }

        dimsDesc += '</ul>\n';
        metricsDesc += '</ul>';

        var descriptionPanel = Ext.getCmp('descriptionPanel');

        var commentsTemplate = new Ext.XTemplate(
            '<table class="xd-table">',
            '<tr>',
            '<td width="100%">',
            '<span class="comments_subnotes">{subnotes}</span>',
            '</td>',
            '</tr>',
            '<tr>',
            '<td width="100%">',
            '<span class="comments_description">{comments}</span>',
            '</td>',
            '</tr>',
            '</table>'
        );

        commentsTemplate.overwrite(descriptionPanel.body, {
            comments: dimsDesc + metricsDesc,
            subnotes: ''
        });
    },

    getJobList: function (personId, person, dataPoint, datasetId, drilldownId, drilldownLabel) {
        var self = this;
        var filters;
        if (self.jobListFilters == null) {
            filters = {
                data: [
                    {
                        dimension_id: 'person',
                        id: 'person=' + personId,
                        realms: ['SUPREMM'],
                        value_id: personId,
                        value_name: person,
                        checked: true
                    },
                    {
                        id: self.config.histogram.group_by + '=' + drilldownId,
                        value_id: drilldownId,
                        value_name: drilldownLabel,
                        dimension_id: self.config.histogram.group_by,
                        realm: [
                            'SUPREMM'
                        ],
                        checked: true
                    }
                ],
                total: 2
            };
        } else {
            var filterData = self.jobListFilters.slice();

            filterData.push({
                dimension_id: 'person',
                id: 'person=' + personId,
                realms: ['SUPREMM'],
                value_id: personId,
                value_name: person,
                checked: true
            });

            filterData.push({
                id: self.config.histogram.group_by + '=' + drilldownId,
                value_id: drilldownId,
                value_name: drilldownLabel,
                dimension_id: self.config.histogram.group_by,
                realm: [
                    'SUPREMM'
                ],
                checked: true
            });

            filters = {
                data: filterData,
                total: filterData.length
            };
        }

        var baseParams = {
            show_title: true,
            timeseries: false,
            aggregation_unit: 'Auto',
            start_date: Ext.getCmp('efficiency').getDurationSelector().getStartDate().format('Y-m-d'),
            end_date: Ext.getCmp('efficiency').getDurationSelector().getEndDate().format('Y-m-d'),
            global_filters: filters,
            start: 0,
            limit: 20,
            data_series: [{
                category: self.config.realm,
                color: 'auto',
                combine_type: 'side',
                display_type: 'column',
                enabled: true,
                filters: {},
                group_by: self.config.histogram.group_by,
                has_std_err: false,
                id: datasetId,
                ignore_global: false,
                line_type: 'Solid',
                line_width: 2,
                log_scale: false,
                long_legend: true,
                metric: self.config.histogram.metric,
                realm: self.config.realm,
                shadow: false,
                sort_type: 'value_desc',
                std_err: false,
                std_err_labels: '',
                trend_line: false,
                value_labels: false,
                visibility: null,
                x_axis: false,
                z_index: 0
            }],
            operation: 'get_rawdata',
            datapoint: dataPoint,
            datasetId: datasetId
        };

        baseParams.global_filters = encodeURIComponent(Ext.util.JSON.encode(baseParams.global_filters));
        baseParams.data_series = encodeURIComponent(Ext.util.JSON.encode(baseParams.data_series));

        var jobListStore = new CCR.xdmod.CustomJsonStore({
            autoDestroy: false,
            autoLoad: true,
            root: 'data',
            totalProperty: 'totalCount',
            successProperty: 'success',
            messageProperty: 'message',
            baseParams: baseParams,
            proxy: new Ext.data.HttpProxy({
                method: 'POST',
                url: 'controllers/metric_explorer.php'
            }),
            fields: [
                { name: 'name', mapping: 'name', type: 'string' },
                { name: 'resource', mapping: 'resource', type: 'string' },
                { name: 'jobid', mapping: 'jobid', type: 'int' },
                { name: 'local_job_id', mapping: 'local_job_id', type: 'int' },
                { name: 'start_time_ts', mapping: 'start_time_ts', type: 'int' },
                { name: 'timezone', mapping: 'timezone', type: 'string' },
                { name: 'cpu_user', mapping: 'cpu_user', type: 'string' },
                { name: 'gpu_usage', mapping: 'gpu_usage', type: 'int' },
                { name: 'max_memory', mapping: 'max_memory', type: 'int' },
                { name: 'catastrophe', mapping: 'catastrophe', type: 'int' },
                { name: 'end_time_ts', mapping: 'end_time_ts', type: 'int' },
                { name: 'wall_time_total', mapping: 'wall_time_total', type: 'int' }
            ]
        });

        var column;
        switch (self.config.analytic) {
            case 'CPU Usage':
                column = {
                    id: 'cpu_user_value',
                    dataIndex: 'cpu_user',
                    header: 'CPU User Value',
                    renderer: function (value) {
                        return (Number(value) * 100).toFixed(2) + '%';
                    }
                };
                break;
            case 'GPU Usage':
                column = {
                    id: 'gpu_usage',
                    dataIndex: 'gpu_usage',
                    header: 'GPU Usage Value',
                    renderer: function (value, p, r) {
                        return (Number(r.json.gpu_usage) * 100).toFixed(2) + '%';
                    }
                };
                break;
            case 'Memory Headroom':
                column = {
                    id: 'max_memory',
                    dataIndex: 'max_memory',
                    header: 'Max Memory',
                    renderer: function (value, p, r) {
                        return (Number(r.json.max_memory) * 100).toFixed(2) + '%';
                    }
                };
                break;
            case 'Homogeneity':
                column = {
                    id: 'catastrophe',
                    dataIndex: 'catastrophe',
                    header: 'Catastrophe',
                    renderer: function (value, p, r) {
                        return (Number(r.json.catastrophe) * 100).toFixed(5);
                    }
                };
                break;
            case 'Wall Time Accuracy':
            case 'Short Job Count':
                column = {
                    id: 'job_wall_time',
                    dataIndex: 'start_time_ts',
                    header: 'Job Wall Time',
                    renderer: function (value, p, r) {
                        return (r.json.end_time_ts - r.json.start_time_ts) + 's';
                    }
                };
                break;
            default:
                break;
        }

        var rawDataGrid = new Ext.grid.GridPanel({
            id: 'raw_data_grid_efficiency',
            region: 'center',
            store: jobListStore,
            loadMask: true,
            border: false,
            colModel: new Ext.grid.ColumnModel({
                defaults: {
                    width: 120,
                    sortable: false,
                    menuDisabled: true
                },
                columns: [{
                    id: 'start_time_ts',
                    dataIndex: 'start_time_ts',
                    header: 'Start Time',
                    width: 140,
                    renderer: function (value, p, r) {
                        return moment.tz(value * 1000, r.json.timezone).format('Y-MM-DD HH:mm:ss z');
                    }
                }, {
                    id: 'raw_data_username',
                    dataIndex: 'name',
                    header: 'User'
                },
                {
                    id: 'local_job_id',
                    dataIndex: 'local_job_id',
                    header: 'Job Id'
                },
                column]
            }),
            listeners: {
                rowclick: function (grid, row_index) {
                    var record = grid.getStore().getAt(row_index);

                    var info = {
                        realm: self.config.realm,
                        text: record.get('resource') + '-' + record.get('local_job_id'),
                        local_job_id: record.get('local_job_id'),
                        job_id: record.get('jobid'),
                        title: 'efficiency-tab'
                    };

                    Ext.getCmp('raw_data_window').close();

                    var token = 'job_viewer?job=' + window.btoa(JSON.stringify(info));
                    Ext.History.add(token);
                }
            },
            bbar: new Ext.PagingToolbar({
                pageSize: 20,
                displayInfo: true,
                displayMsg: 'Showing jobs {0} - {1} of {2}',
                emptyMsg: 'No jobs to display',
                store: jobListStore,
                listeners: {
                    load: function (store, records, options) {
                        this.onLoad(store, records, options);
                    }
                }
            })
        });

        var rawData = new Ext.Window({
            id: 'raw_data_window',
            height: 510,
            width: 500,
            closable: true,
            border: false,
            modal: true,
            // Update title when all statistics are in
            title: 'Jobs with ' + drilldownLabel + ' ' + self.config.histogram.groupByTitle + ' for ' + person,
            layout: 'fit',
            autoScroll: true,
            items: new Ext.Panel({
                layout: 'border',
                items: rawDataGrid
            }),
            listeners: {
                close: function () {
                    rawData.hide();
                }
            }
        });

        rawData.show();
    },

    // Destroy chart when panel is destroyed
    listeners: {
        destroy: function (e) {
            if (this.chart) {
                this.chart.destroy();
                this.chart = null;
            }
        }
    }
});
