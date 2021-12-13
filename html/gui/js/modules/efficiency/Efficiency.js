/*
 * XDMoD.Module.Efficiency
 * @author Hannah Taylor
 *
 */
XDMoD.Module.Efficiency = Ext.extend(XDMoD.PortalModule, {
    //Portal Module Properties 
    title: 'Efficiency',
    module_id: 'efficiency',

    //Portal Module Toolbar Config 
    usesToolbar: true,
    toolbarItems: {
        durationSelector: true
    },

    initComponent: function () {
        var self = this;

        //Get the analytics that will be displayed
        Ext.Ajax.request({
            url: XDMoD.REST.url + '/efficiency/analytics',
            method: 'GET',
            params: {
                token: XDMoD.REST.token,
            },
            callback: function (o, success, response) {
                if (success) {
                    analytics = JSON.parse(response.responseText);
                    self.getAnalyticCardDisplay(analytics);
                }
            },
            failure: function (response) {
                Ext.Msg.alert(
                    response.statusText || 'Analytics Not Found',
                    JSON.parse(response.responseText).message || 'Analytics not found. Please contact system administrator to troubleshoot error.'
                );
            }
        })

        //Handle duration change for each active item
        self.on('duration_change', function () {
            var mainPanel = Ext.getCmp('efficiency_display_panel');
            var activeItem = mainPanel.getLayout().activeItem;
            var activeItemIndex = mainPanel.items.indexOf(activeItem);

            //Active item is analytic cards view
            if (activeItemIndex == 0) {
                self.reloadCharts(analytics);
            }
            //Active item is scatter plot or drilldown histogram view
            else if (activeItemIndex == 1) {
                analytic = activeItem.config.analytic
                var activeItem = Ext.getCmp('detailed_analytic_panel_' + analytic).getLayout().activeItem;
                var activeItemIndex = Ext.getCmp('detailed_analytic_panel_' + analytic).items.indexOf(activeItem);

                var scatterPlotPanel = Ext.getCmp('analytic_scatter_plot_' + analytic)

                //Active item is scatter plot
                if (activeItemIndex == 0) {

                    var id = mainPanel.getLayout().activeItem.id;

                    var analyticPanel = Ext.getCmp(id)
                    var analyticConfig = analyticPanel.config

                    //If filters have been applied, keep applied 
                    //Otherwise, only use filters that are needed for initial plot
                    if(scatterPlotPanel.aggFilters){
                        var filterObj = scatterPlotPanel.aggFilters;
                    }else{
                        var filterObj = analyticConfig.filters;
                    }

                    scatterPlotPanel.store.reload({
                        params: {
                            config: JSON.stringify({
                                realm: analyticConfig.realm,
                                group_by: 'person',
                                aggregation_unit: 'day',
                                start_date: Ext.getCmp('efficiency').getDurationSelector().getStartDate(),
                                end_date: Ext.getCmp('efficiency').getDurationSelector().getEndDate(),
                                order_by: {
                                    field: analyticConfig.field,
                                    dirn: 'asc'
                                },
                                filters: filterObj,
                                statistics: analyticConfig.statistics
                            })
                        }
                    })
                } 
                //Active item is drilldown histogram
                else if (activeItemIndex == 1) {
                    var store = Ext.StoreMgr.lookup('histogram_chart_store_' + analytic);
                    var hcPanel = Ext.getCmp('hc-panel-' + analytic);
                    var person = hcPanel.person;
                    var personId = hcPanel.personId;

                    //If filters have applied, keep applied
                    if (scatterPlotPanel.MEFilters) {
                        var filters = scatterPlotPanel.MEFilters.slice();
                        filters.push({
                            dimension_id: "person",
                            id: "person=" + personId,
                            realms: ["SUPREMM"],
                            value_id: personId,
                            value_name: person,
                            checked: true
                        })

                        //Format filter as needed for ME
                        var filterObj = {
                            data: filters,
                            total: filters.length
                        }
                    } 
                    //If no filters applied, keep filtering on person
                    else {
                        var filters = [{
                            dimension_id: "person",
                            id: "person=" + personId,
                            realms: ["SUPREMM"],
                            value_id: personId,
                            value_name: person,
                            checked: true
                        }]

                        var filterObj = {
                            data: filters,
                            total: filters.length
                        }
                    }

                    store.baseParams.start_date = Ext.getCmp('efficiency').getDurationSelector().getStartDate().format('Y-m-d')
                    store.baseParams.end_date = Ext.getCmp('efficiency').getDurationSelector().getEndDate().format('Y-m-d')

                    store.baseParams.global_filters = encodeURIComponent(Ext.util.JSON.encode(filterObj))
                    store.reload()

                }
            }
        })

        //Container for the analytic card display
        var analyticCardPanel = new Ext.Panel({
            id: 'analytic_card_panel',
            border: false,
            frame: false,
            autoScroll: true
        })

        //Efficiency tab main panel with card layout to allow for switching between views
        var mainPanel = new Ext.Panel({
            id: 'efficiency_display_panel',
            frame: false,
            layout: 'card',
            border: false,
            activeItem: 0,
            region: 'center',
            items: [
                analyticCardPanel
            ]
        });

        Ext.apply(this, {
            customOrder: self.getToolbarConfig(),
            items: [
                mainPanel
            ]
        });

        XDMoD.Module.Efficiency.superclass.initComponent.apply(this, arguments);
    },

    getToolbarConfig: function () {
        var breadcrumbMenu = {
            xtype: 'buttongroup',
            id: 'breadcrumb_btns',
            frame: false,
            items: [
                { xtype: 'tbtext', text: 'Navigation: ' },
                {
                xtype: 'button',
                text: 'Analytic Cards',
                id: 'analytic_breadcrumb_btn',
                disabled: true,
                iconCls: 'btn_dashboard',
                handler: function () {
                    //Display card view and remove panel for scatterplot/drilldown view
                    var mainPanel = Ext.getCmp('efficiency_display_panel');
                    mainPanel.layout.setActiveItem(0);
                    mainPanel.doLayout();
                    mainPanel.remove(mainPanel.items.items[1], true);

                    //Disable this button when in analytic card view
                    this.disable();

                    //Remove all other links in breadcrumb menu
                    var breadcrumbMenu = Ext.getCmp('breadcrumb_btns');
                    var length = breadcrumbMenu.items.length;
                    for (var i = 2; i < length; i++) {
                        breadcrumbMenu.remove(2)
                    }
                    breadcrumbMenu.doLayout()
                }
            }]
        }

        return [
            XDMoD.ToolbarItem.DURATION_SELECTOR,
            breadcrumbMenu
        ];
    },

    analyticCardTemplate: [
        //Template for creating cards for each analytic 
        '<div class="analyticCardContents">',
        '<div class="analyticHeader">',
        '<h1>{analytic}</h1>',
        '<p>{description}</p>',
        '</div>',
        '<div class="analyticScatterPlotThumbnail" id="{analytic}Chart"></div>',
        '</div>'
    ],

    getAnalyticCardDisplay: function (data) {
        var self = this;
        var analtyicCardPanel = Ext.getCmp('analytic_card_panel')

        //Add container for each type of analytic
        var i, j;
        for (i = 0; i < data.data.length; i++) {
            var analytics = data.data[i].analytics;
            var typePanel = new Ext.Panel({
                border: false,
                frame: false,
                items: [
                    new Ext.BoxComponent({
                        data: data.data[i],
                        tpl: '<div> <h1>{type}</h1><p>{typeDescription}</p}</div>',
                        cls: 'analyticTypeHeader'
                    })
                ]
            })

            //Add the analytic card to the analytic type container
            for (j = 0; j < analytics.length; j++) {
                var analyticCard = new Ext.Panel({
                    id: 'analytic_card_' + analytics[j].analytic,
                    frame: false,
                    border: false,
                    data: analytics[j],
                    tpl: self.analyticCardTemplate,
                    cls: 'analyticCard',
                    listeners: {
                        afterrender: function (component) {
                            //Get the scatter plot for the analytic
                            self.getAnalyticPlots(component.initialConfig.data);

                            //Add listener so user can see detailed view of analytic when card is clicked
                            var el = component.getEl();
                            el.on('click', function () {
                                self.showAnalyticPanel(component.initialConfig.data);
                            });
                        }
                    }
                })
                typePanel.add(analyticCard);
            }
            analtyicCardPanel.add(typePanel);
        }

        analtyicCardPanel.doLayout();
    },

    //Config parameter is the analytic and associated information needed to populate scatter plot and drilldown chart
    getAnalyticPlots: function (config) {
        var self = this;

        //Get the statistics that will be shown in the scatter plot
        var xStatistic = config.statistics[0];
        var yStatistic = config.statistics[1];

        //Chart settings
        var chartConfig = {
            chart: {
                renderTo: config.analytic + 'Chart',
                type: 'scatter',
                backgroundColor: '#F8F7F7'
            },
            title: {
                text: null,
            },
            navigation: {
                buttonOptions: {
                    enabled: false
                }
            },
            loading: {
                style: {
                    opacity: 0.7
                }
            },
            credits: { enabled: false },
            legend: {
                enabled: false
            },
            tooltip: { enabled: false },
            plotOptions: {
                series: {
                    turboThreshold: 3000,
                    allowPointSelect: false,
                    states: { hover: { enabled: false } }
                },
            },
            xAxis: {
                title: {
                    text: config.statisticLabels[0],
                },
                min: 0,
                gridLineWidth: 1,
                showLastLabel: true,
                showFirstLabel: true,
                lineColor: '#ccc',
                lineWidth: 1,
                plotLines: [{
                    color: 'black',
                    dashStyle: 'solid',
                    width: 2
                }]
            },
            yAxis: {
                title: {
                    text: config.statisticLabels[1],
                },
                min: 0,
                gridLineWidth: 1,
                showLastLabel: true,
                showFirstLabel: true,
                lineColor: '#ccc',
                lineWidth: 1,
                plotLines: [{
                    color: 'black',
                    dashStyle: 'solid',
                    width: 2
                }]
            },
            series: [
                { data: [] },
                { data: [] }
            ]
        }

        var chart = new Highcharts.Chart(chartConfig);

        new Ext.data.JsonStore({
            id: 'analytic_store_' + config.analytic,
            restful: true,
            url: XDMoD.REST.url + '/efficiency/scatterPlot',
            root: 'results',
            autoLoad: true,
            baseParams: {
                start: 0,
                limit: 10000,
                config: JSON.stringify({
                    realm: config.realm,
                    group_by: 'person',
                    aggregation_unit: 'day',
                    start_date: Ext.getCmp('efficiency').getDurationSelector().getStartDate(),
                    end_date: Ext.getCmp('efficiency').getDurationSelector().getEndDate(),
                    order_by: {
                        field: config.field,
                        dirn: 'asc'
                    },
                    filters: config.filters,
                    statistics: config.statistics
                })
            },
            fields: [xStatistic, yStatistic],
            listeners: {
                exception: function (proxy, type, action, exception, response) {
                    switch (response.status) {
                        case 403:
                        case 500:
                            var details = Ext.decode(response.responseText);
                            document.getElementById(config.analytic + 'Chart').innerHTML = '<div class="analyticInfoError">Error: ' + response.status + ' (' + response.statusText + ')<br>Details: ' + details.message + '</div>';
                            break;
                        case 401:
                            // Do nothing
                            break;
                        default:
                            var details = Ext.decode(response.responseText);
                            document.getElementById(config.analytic + 'Chart').innerHTML = '<div class="analyticInfoError">Error: ' + response.status + ' (' + response.statusText + ')<br>Details: ' + details.message + '</div>';
                            break;
                    }
                },
                beforeLoad: function () {
                    //Remove any prior error messages before redrawing chart
                    document.getElementById(config.analytic + 'Chart').innerHTML = '';
                    chart.redraw();

                    //Add loading message
                    chart.showLoading();
                },
                load: function () {
                    /*  
                        Result dataset is what a user has access to and is allowed to drilldown on
                        General dataset is all data without identifying information(name) attached
                        Both datasets are included on scatterplot as separate series and depending on user access
                    */
                    var resultData = this.data.items[0].json.results;
                    var generalData = this.data.items[0].json.hiddenData;

                    //Check if any data is available
                    if (resultData.length > 0 || generalData.length > 0) {

                        //Users with both specific and general data
                        if (resultData.length > 0 && generalData.length > 0) {
                            //Get the general data series without name information
                            var dataset = self.formatData(generalData, false, xStatistic, yStatistic);
                            var generalSeriesData = dataset[0];
                            var generalXMax = dataset[1];
                            var generalYMax = dataset[2];

                            //Get the result data series with name information
                            var dataset = self.formatData(resultData, true, xStatistic, yStatistic);
                            var resultSeriesData = dataset[0];
                            var resultXMax = dataset[1];
                            var resultYMax = dataset[2];

                            //Get axis max values for scatter plot
                            var xAxisMax = Math.max(generalXMax, resultXMax);
                            var yAxisMax = Math.max(generalYMax, resultYMax);

                            chart.series[0].update({
                                    data: generalSeriesData
                            });
                            
                            chart.series[1].update({
                                    data: resultSeriesData,
                                    marker: {
                                        fillColor: 'transparent',
                                        symbol: 'circle',
                                        radius: 10,
                                        lineWidth: 2,
                                        lineColor: 'black' // inherit from series
                                    }
                            });

                        } else if (generalData.length > 0) {
                            var dataset = self.formatData(generalData, false, xStatistic, yStatistic);
                            var generalSeriesData = dataset[0]
                            var xAxisMax = dataset[1]
                            var yAxisMax = dataset[2]

                            chart.series[0].update({
                                data: generalSeriesData
                            });
                            
                        } else if (resultData.length > 0) {
                            //If no restrictions in place, get data with general data set formatting (blue and red points indicating efficiency)
                            //Get the general data series with name information and x and y axis max
                            var dataset = self.formatData(resultData, false, xStatistic, yStatistic);
                            var resultSeriesData = dataset[0]
                            var xAxisMax = dataset[1]
                            var yAxisMax = dataset[2]

                            chart.series[0].update({
                                data: resultSeriesData
                            });
                        }

                        //Update x and y axis to reflect the max and min
                        chart.yAxis[0].update({
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

                        chart.xAxis[0].update({
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

                        chart.redraw()
                        chart.hideLoading()
                    } else {
                        document.getElementById(config.analytic + 'Chart').innerHTML = "<div class='analyticInfoError'> No data available during this time frame for this analytic.";
                    }
                }
            }
        })
    },

    formatData: function (dataset, xStatistic, yStatistic) {
        var data = []

        //Get x and y axis max to use for scatter plot plot lines
        var xAxisMax = this.getMax(dataset, xStatistic);
        if (xAxisMax < 100) {
            xAxisMax = 100;
        }
        var yAxisMax = this.getMax(dataset, yStatistic);

        for (var i = 0; i < dataset.length; i++) {
            var x = parseInt(dataset[i][xStatistic]);
            var y = parseInt(dataset[i][yStatistic]);

            if (x > xAxisMax / 2 && y > yAxisMax / 2) {
                var color = '#ff0000';
            } else {
                var color = '#2f7ed8';
            }

            var dataPt = { x: x, y: y, color: color };
            data.push(dataPt);
        }

        return [data, xAxisMax, yAxisMax]
    },

    getMax: function (record, property) {
        var max, i;
        for (i = 0; i < record.length; i++) {
            if (parseInt(record[i][property])) {
                if (max == null || parseInt(record[i][property]) > max) {
                    var max = parseInt(record[i][property]);
                }
            }
        }
        return max;
    },

    reloadCharts: function (data) {
        //Reload each chart with new start and end date
        for (var i = 0; i < data.data.length; i++) {
            var analytics = data.data[i].analytics;
            for (var j = 0; j < analytics.length; j++) {
                var analyticStore = Ext.StoreMgr.lookup('analytic_store_' + analytics[j].analytic);
                analyticStore.reload({
                    params: {
                        config: JSON.stringify({
                            realm: analytics[j].realm,
                            group_by: 'person',
                            aggregation_unit: 'day',
                            start_date: Ext.getCmp('efficiency').getDurationSelector().getStartDate(),
                            end_date: Ext.getCmp('efficiency').getDurationSelector().getEndDate(),
                            order_by: {
                                field: analytics[j].field,
                                dirn: 'asc'
                            },
                            filters: analytics[j].filters,
                            statistics: analytics[j].statistics
                        })
                    }
                });
            }
        }
    },

    showAnalyticPanel: function (chartConfig) {
        var analyticPanel = new XDMoD.Module.Efficiency.AnalyticPanel({
            id: 'analytic_panel_' + chartConfig.analytic,
            config: chartConfig
        });

        //Add new breadcrumb for the scatter plot
        var btn = {
            xtype: 'button',
            text: chartConfig.analytic,
            id: chartConfig.analytic + '_breadcrumb_btn',
            disabled: true,
            iconCls: 'scatter',
            handler: function () {
                //Display the scatter plot panel and remove the drilldown histogram panel 
                var analyticPanel = Ext.getCmp('detailed_analytic_panel_' + chartConfig.analytic);
                analyticPanel.layout.setActiveItem(0);
                analyticPanel.doLayout();
                analyticPanel.remove(analyticPanel.items.items[1], true);

                //Remove all other links in breadcrumb menu
                var breadcrumbMenu = Ext.getCmp('breadcrumb_btns');
                var length = breadcrumbMenu.items.length;
                for (var i = 4; i < length; i++) {
                    breadcrumbMenu.remove(4);
                }
                breadcrumbMenu.doLayout();

                //Update the description panel to match the chart being shown
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
                    'comments': chartConfig.statisticDescription,
                    'subnotes': ""
                });


                //Update the filter check boxes to reflect what was checked previously prior to navigating to the histogram
                var dimensions = ['Queue', 'Application', 'Resource', 'PI'];
                var filters = Ext.getCmp('analytic_scatter_plot_' + chartConfig.analytic).aggFilters;

                for (var i = 0; i < dimensions.length; i++) {
                    //Get all boxes that were checked in drilldown view and remove the checks 
                    var filterList = Ext.getCmp('checkbox_group' + dimensions[i]).getValue()
                    Ext.each(filterList, function (f) {
                        Ext.getCmp('checkbox_group' + dimensions[i]).setValue(f.id, false)
                    })

                    //Check all filters that were applied prior to navigating to the histogram - these are stored in the aggregate filter variable in the scatter plot panel 
                    Ext.each(filters, function (filter) {
                        if (filter[dimensions[i].toLowerCase()]) {
                            Ext.each(filter[dimensions[i].toLowerCase()], function(value){
                                Ext.getCmp('checkbox_group' + dimensions[i]).setValue(value, true)
                            })
                        }
                    }
                    )
                }

                //Disable this btn on showing the scatter plot 
                this.disable()
            }
        }

        //Enable breadcrumb btn that navigates to analytic card view
        Ext.getCmp('analytic_breadcrumb_btn').enable()

        //Add new spacer and scatter plot button 
        var breadcrumbMenu = Ext.getCmp('breadcrumb_btns');
        breadcrumbMenu.add({ xtype: 'tbtext', text: '&#10142' })
        breadcrumbMenu.add(btn);
        breadcrumbMenu.doLayout();

        //Load new panel with corresponding analytic chart
        var mainPanel = Ext.getCmp('efficiency_display_panel');
        mainPanel.add(analyticPanel);
        mainPanel.layout.setActiveItem(1);
        mainPanel.doLayout();
    }

});
