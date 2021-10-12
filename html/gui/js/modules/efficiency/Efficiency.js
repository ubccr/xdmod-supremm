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

    //Efficiency Tab Properties 
    token: XDMoD.REST.token,
    analyticURL: XDMoD.REST.url + '/efficiency/analytics',

    initComponent: function () {
        var self = this;

        //Handle duration change for each active item
        self.on('duration_change', function () {
            var mainPanel = Ext.getCmp('efficiency_display_panel')
            var activeItem = mainPanel.getLayout().activeItem
            var activeItemIndex = mainPanel.items.indexOf(activeItem)

            if (activeItemIndex == 0) {
                self.reloadCharts(self.analyticURL, self.token)
            } else if (activeItemIndex == 1) {
                //reload chart with filters 
            }
        })

        self.getAnalyticCardDisplay(self.analyticURL, self.token)

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
            items: [
                mainPanel
            ]
        });// Ext.apply

        XDMoD.Module.Efficiency.superclass.initComponent.apply(this, arguments);
    }, // initComponent

    analyticCardTemplate: [
        //Template for creating cards for each analytic 
        '<div class="analyticCardContents">',
        '<div class="analyticHeader">',
        '<h1>{analytic}</h1>',
        '<p>{description}</p>',
        '</div>',
        '<div class="analyticScatterPlotThumbnail" id="{analytic}Chart"></div>',
        '</div>'
    ], //analyticCardTemplate

    getAnalyticCardDisplay: function (url, token) {
        var self = this;

        //Ajax request to get each analytic and corresponding chart config 
        Ext.Ajax.request({
            url: url,
            method: 'GET',
            params: {
                token: token
            },
            success: function (response) {
                var exists = CCR.exists;

                var data = JSON.parse(response.responseText);
                var success = exists(data) && data.success;
                if (success) {
                    var analtyicCardPanel = Ext.getCmp('analytic_card_panel')

                    //Add container for each type of analytic 
                    for (i = 0; i < data.data.length; i++) {
                        var analytics = data.data[i].analytics

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
                                        var el = comp.getEl();
                                        el.on('click', function () {
                                            self.showAnalyticPanel(comp.initialConfig.data)
                                        })
                                    }
                                }
                            })

                            self.getAnalyticPlots(analytics[j])
                            typePanel.add(analyticCard)
                        }
                        analtyicCardPanel.add(typePanel)
                    }
                    analtyicCardPanel.doLayout()
                }else{
                    Ext.MessageBox.show({
                        title: 'Analytic Loading error',
                        msg: 'There was an error loading analytic data.',
                        icon: Ext.MessageBox.ERROR,
                        buttons: Ext.MessageBox.OK
                    });
                }
            },
            error: function () {
                Ext.MessageBox.show({
                    title: 'Analytic Loading error',
                    msg: 'There was an error loading analytic data.',
                    icon: Ext.MessageBox.ERROR,
                    buttons: Ext.MessageBox.OK
                });
            }
        })
    },

    getAnalyticPlots: function (config) {
        var renderId = config.analytic + 'Chart'
        var startDate = Ext.getCmp('efficiency').getDurationSelector().getStartDate();
        var endDate = Ext.getCmp('efficiency').getDurationSelector().getEndDate();

        var xStatistic = config.statistics[0]
        var yStatistic = config.statistics[1]

        var analyticStore = new Ext.data.JsonStore({
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
                    start_date: startDate,
                    end_date: endDate,
                    order_by: {
                        field: config.field,
                        dirn: 'asc'
                    },
                    filters: [],
                    statistics: config.statistics
                })
            },
            fields: [xStatistic, yStatistic, 'name'],
            listeners: {
                load: function () {
                    //Get record from store and push individual data points to the data array to be used by Highcharts
                    //Data array includes x value, y value, person(name), and data point color 
                    var record = analyticStore.data.items;
                    var data = [];

                    // These are just placeholders - need to get values from data
                    var xAxisMax = 100
                    var yAxisMax = 1000

                    for (i = 1; i < record.length; i++) {
                        var x = parseInt(record[i].data.xStatistic)
                        var y = parseInt(record[i].data.yStatistic)
                        var person = record[i].data.name;
                        var personId = record[i].id;

                        if (x > xAxisMax / 2 && y > yAxisMax / 2) {
                            var color = '#ff0000';
                        } else {
                            var color = '#2f7ed8';
                        }

                        var dataPt = { x, y, person, personId, color, drilldown }
                        data.push(dataPt);
                    };

                    //Create new chart from data store 
                    new Highcharts.Chart({
                        chart: {
                            renderTo: renderId,
                            type: 'scatter',
                            zoomType: 'xy',
                            backgroundColor: '#F8F7F7',
                            selectionMarkerFill: 'none',
                            width: null,
                            height: null,
                        },
                        title: {
                            text: null,
                        },
                        navigation: {
                            buttonOptions: {
                                enabled: false
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
                            //Placement of x-axis plot line, should be in center of scatter plot 
                            plotLines: [{
                                color: 'black', // Color value
                                dashStyle: 'solid', // Style of the plot line. Default to solid
                                value: xAxisMax / 2, // Value of where the line will appear
                                width: 2 // Width of the line    
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
                            //Placement of y-axis plot line, should be in center of scatter plot 
                            plotLines: [{
                                color: 'black', // Color value
                                dashStyle: 'solid', // Style of the plot line. Default to solid
                                value: yAxisMax / 2, // Value of where the line will appear
                                width: 2 // Width of the line    
                            }]
                        },
                        series: [{
                            data: data
                        }]
                    })
                }
            }
        })
        analyticStore.load()
    },

    reloadCharts: function (url, token) {
        var self = this;

        Ext.Ajax.request({
            url: url,
            method: 'GET',
            params: {
                token: token
            },
            success: function (response) {
                var data = JSON.parse(response.responseText);

                //Reload each chart with new start and end date 
                for (i = 0; i < data.data.length; i++) {
                    var analytics = data.data[i].analytics
                    for (j = 0; j < analytics.length; j++) {
                        self.getAnalyticPlots(analytics[j])
                    }
                }

            },
            error: function () {
                Ext.MessageBox.show({
                    title: 'Analytic Loading Error',
                    msg: 'There was an error loading analytic data.',
                    icon: Ext.MessageBox.ERROR,
                    buttons: Ext.MessageBox.OK
                });
            }
        })

    },

    showAnalyticPanel: function (chartConfig) {
        var analyticPanel = new XDMoD.Module.Efficiency.AnalyticPanel({
            id: 'analytic_panel_' + chartConfig.analytic,
            config: chartConfig
        })

        var mainPanel = Ext.getCmp('efficiency_display_panel')
        mainPanel.add(analyticPanel)
        mainPanel.layout.setActiveItem(1)
        mainPanel.doLayout()
    },

});// XDMoD.Module.Efficiency