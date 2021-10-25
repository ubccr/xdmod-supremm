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
        var analytics = []
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
            failure: function(response){
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

            if (activeItemIndex == 0) {
                self.reloadCharts(analytics);
            } else if (activeItemIndex == 1) {
                //reload analytic chart with filters
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
            items: [{
                text: 'Analytic Cards', 
                handler: function(){
                   var mainPanel = Ext.getCmp('efficiency_display_panel');
                   mainPanel.layout.setActiveItem(0);
                   mainPanel.doLayout();

                }
            }]
        }

        return [
            XDMoD.ToolbarItem.DURATION_SELECTOR,
            '->',
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
            });

            //Add analytic card for each analytic within type
            for (j = 0; j < analytics.length; j++) {
                var analyticCard = new Ext.Panel({
                    id: 'analytic_card_' + analytics[j].analytic,
                    frame: false,
                    border: false,
                    data: analytics[j],
                    tpl: self.analyticCardTemplate,
                    cls: 'analyticCard',
                    listeners: {
                        afterrender: function (comp) {
                            self.getAnalyticPlots(comp.initialConfig.data);
                            var el = comp.getEl();
                            el.on('click', function () {
                                self.showAnalyticPanel(comp.initialConfig.data)
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

    getAnalyticPlots: function (config) {
        var renderId = config.analytic + 'Chart';

        var xStatistic = config.statistics[0];
        var yStatistic = config.statistics[1];

        var analyticStore = new Ext.data.JsonStore({
            id: 'analytic_store_' + config.analytic,
            restful: true,
            url: XDMoD.REST.url + '/warehouse/aggregatedata',
            root: 'results',
            autoLoad: true,
            baseParams: {
                start: 0,
                limit: 1000,
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
                    filters: [],
                    statistics: config.statistics
                })
            },
            fields: [xStatistic, yStatistic, 'name']
        })


        //Get record from store and push individual data points to the data array to be used by Highcharts
        //Data array includes x value, y value, person(name), and data point color
        analyticStore.on("load", function () {
            var record = this.data.items;

            //Check that data is available for the analytic
            if (record.length > 0) {
                var data = [];

                //Set minimum axis values
                var xAxisMax = 100;
                var yAxisMax = 100;

                //Set maximum axis values
                var i;
                for (i = 0; i < record.length; i++) {
                    if (parseInt(record[i].data[yStatistic]) > parseInt(yAxisMax)) {
                        yAxisMax = parseInt(record[i].data[yStatistic]);
                    }

                    if (parseInt(record[i].data[xStatistic]) > parseInt(xAxisMax)) {
                        xAxisMax = parseInt(record[i].data[xStatistic]);
                    }
                }

                //Get the series data
                var i;
                for (i = 0; i < record.length; i++) {
                    var x = parseInt(record[i].data[xStatistic]);
                    var y = parseInt(record[i].data[yStatistic]);

                    var person = record[i].data.name;
                    var personId = record[i].id;

                    if (x > xAxisMax / 2 && y > yAxisMax / 2) {
                        var color = '#ff0000';
                    } else {
                        var color = '#2f7ed8';
                    }

                    var dataPt = { x, y, person, personId, color };
                    data.push(dataPt);
                };

                //Chart Config 
                var chartConfig = {
                    chart: {
                        renderTo: renderId,
                        type: 'scatter',
                        backgroundColor: '#F8F7F7',
                        width: null,
                        height: null,
                        events: {
                            load: function (event) {
                            }
                        }
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
                            allowPointSelect: false,
                            states: { hover: { enabled: false } }
                        },
                    },
                    xAxis: {
                        title: {
                            text: config.statisticLabels[0],
                        },
                        min: 0,
                        max: xAxisMax,
                        tickInterval: xAxisMax / 4,
                        tickLength: 0,
                        gridLineWidth: 1,
                        showLastLabel: true,
                        showFirstLabel: true,
                        lineColor: '#ccc',
                        lineWidth: 1,
                        plotLines: [{
                            color: 'black',
                            dashStyle: 'solid',
                            value: xAxisMax / 2,
                            width: 2    
                        }]

                    },
                    yAxis: {
                        title: {
                            text: config.statisticLabels[1],
                        },
                        min: 0,
                        max: yAxisMax,
                        tickInterval: yAxisMax / 4,
                        tickLength: 0,
                        gridLineWidth: 1,
                        showLastLabel: true,
                        showFirstLabel: true,
                        lineColor: '#ccc',
                        lineWidth: 1,
                        plotLines: [{
                            color: 'black',
                            dashStyle: 'solid',
                            value: yAxisMax / 2,
                            width: 2   
                        }]
                    },
                    series: [{
                        data: data
                    }]
                }

                new Highcharts.Chart(chartConfig);

            } else {
                document.getElementById(config.analytic + 'Chart').innerHTML = "No data available during this time frame for this analytic.";
            }
        })
    },

    reloadCharts: function (data) {
        //Reload each chart with new start and end date
        var i, j;
        for (i = 0; i < data.data.length; i++) {
            var analytics = data.data[i].analytics;
            for (j = 0; j < analytics.length; j++) {
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
                            filters: [],
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

        //Add new breadcrumb
        var breadcrumbMenu = Ext.getCmp('breadcrumb_btns');
        breadcrumbMenu.add({ text: chartConfig.analytic });
        breadcrumbMenu.doLayout();

        //Load new panel with corresponding analytic chart
        var mainPanel = Ext.getCmp('efficiency_display_panel');
        mainPanel.add(analyticPanel);
        mainPanel.layout.setActiveItem(1);
        mainPanel.doLayout();
    }
});
