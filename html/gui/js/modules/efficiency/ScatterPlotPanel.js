Ext.namespace('XDMoD', 'XDMoD.Module', 'XDMoD.Module.Efficiency');

XDMoD.Module.Efficiency.ScatterPlotPanel = Ext.extend(Ext.Panel, {
    chart: null,
    store: null,

    initComponent: function () {
        var self = this;

        var createChart = function () {
            var defaultChartSettings = {
                chart: {
                    renderTo: self.id + '_hc',
                    type: 'scatter',
                    width: self.width,
                    height: self.height,
                },
                colors: ['#2f7ed8', '#0d233a', '#8bbc21', '#910000', '#1aadce', '#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a'],
                title: {
                    style: {
                        color: '#444b6e',
                        fontSize: '20px'
                    },
                    text: self.config.analytic
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
                        return '<b>' + this.point.person + '</b><br>' + self.config.statisticLabels[0] + ': <b>' + this.point.x + ' ' + self.config.valueLabels[0] +'</b><br>' + self.config.statisticLabels[1] + ': <b>' + this.point.y + ' ' + self.config.valueLabels[1] + '</b>' 
                    }
                },
                plotOptions: {
                    series: {
                        events: {
                            click: function (e) {
                                //load next chart (grouped by person and with filters applied)
                            }
                        }
                    }
                },
                xAxis: {
                    title: {
                        text: self.config.statisticLabels[0]
                    },
                    min: 0,
                    max: 100,
                    tickInterval: 100 / 4,
                    tickLength: 0,
                    gridLineWidth: 1,
                    showLastLabel: true,
                    showFirstLabel: true,
                    lineColor: '#ccc',
                    lineWidth: 1,
                    //Placement of x-axis plot line, should be in center of scatter plot 
                    plotLines: [{
                        color: 'black', // Color value
                        dashStyle: 'solid', // Style of the plot line. Default to solid
                        value: 100 / 2, // Value of where the line will appear
                        width: 2 // Width of the line    
                    }]

                },
                yAxis: {
                    title: {
                        text: self.config.statisticLabels[1]
                    },
                    min: 0,
                    max: 10000,
                    tickInterval: 10000 / 4,
                    tickLength: 0,
                    gridLineWidth: 1,
                    showLastLabel: true,
                    showFirstLabel: true,
                    lineColor: '#ccc',
                    lineWidth: 1,
                    //Placement of y-axis plot line, should be in center of scatter plot 
                    plotLines: [{
                        color: 'black', // Color value
                        dashStyle: 'solid', // Style of the plot line. Default to solid
                        value: 10000 / 2, // Value of where the line will appear
                        width: 2 // Width of the line    
                    }]
                }
            };

            var chartOptions = jQuery.extend(true, {}, defaultChartSettings, self.chartSettings);

            self.chart = new Highcharts.Chart(chartOptions);
            self.chart.showLoading();

            self.store.load();
        };

        var defaultStoreSettings = {
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
                load: function (inst) {
                    var store = inst;

                    var record = store.data.items;
                    var data = self.getSeriesData(record)

                    if (data.length < 1) {
                        self.chart.hideLoading();
                        self.chart.renderer.image('gui/images/report_thumbnail_no_data.png', (self.chart.chartWidth - 400) / 2, (self.chart.chartHeight - 300) / 2, 400, 300).add();

                    } else {

                        //Sex x axis max 
                        var xAxisMax = self.getMax(record, self.config.statistics[0]);
                        var yAxisMax = self.getMax(record, self.config.statistics[1]);

                        //Only update x axis if value is greater than 100 - this is to serve any statistics that are not a percentage (wall time, short job count)
                        if (xAxisMax > 100){
                            self.chart.xAxis[0].update({
                                max: Math.ceil(xAxisMax / 1000) * 1000,
                                tickInterval: Math.ceil(xAxisMax / 1000) * 1000 / 4,
                                plotLines: [{
                                    color: 'black',
                                    dashStyle: 'solid',
                                    value: Math.ceil(xAxisMax / 1000) * 1000 / 2,
                                    width: 2
                                }]
                            });
                        }

                        self.chart.yAxis[0].update({
                            max: Math.ceil(yAxisMax / 1000) * 1000,
                            tickInterval: Math.ceil(yAxisMax / 1000) * 1000 / 4,
                            plotLines: [{
                                color: 'black',
                                dashStyle: 'solid',
                                value: Math.ceil(yAxisMax / 1000) * 1000 / 2,
                                width: 2
                            }]
                        });


                        //Set new or update series data
                        if (!self.chart.series[0]) {
                            self.chart.addSeries({
                                data: data
                            })
                        } else {
                            //Update series when adding 
                            self.chart.series[0].update({
                                data: data
                            })
                        }

                        //Redraw chart to reflect the changes 
                        self.chart.hideLoading();
                        self.chart.redraw();
                    }
                }
            }
        };

        var storeSettings = jQuery.extend(true, {}, defaultStoreSettings, this.panelSettings.store);

        this.store = new Ext.data.JsonStore(storeSettings);

        this.layout = 'fit';
        this.items = [{
            xtype: 'container',
            id: this.id + '_hc',
            listeners: {
                resize: function () {
                    if (self.chart) {
                        self.chart.reflow();
                    }
                },
                render: createChart
            }
        }];

        XDMoD.Module.Efficiency.ScatterPlotPanel.superclass.initComponent.call(this, arguments);
    },

    getMax: function (record, property) {
        var max;

        for (i = 0; i < record.length; i++) {
            if (max == null || record[i].data[property] > max) {
                var max = record[i].data[property]
            }
        }

        return max
    },

    getSeriesData: function (record) {
        var data = [];

        for (i = 0; i < record.length; i++) {
            var x = parseInt(record[i].data[this.config.statistics[0]])
            var y = parseInt(record[i].data[this.config.statistics[1]])
            var person = record[i].data.name;

            data.push({ x, y, person })
        }

        return data
    },

    listeners: {
        destroy: function (e) {

            console.log(e)
            if (this.chart) {
                this.chart.destroy();
                this.chart = null;
            }
        }
    }
});
