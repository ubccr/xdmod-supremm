/*
 * XDMoD.Module.Efficiency
 * @author Hannah Taylor
 *
 */

XDMoD.utils.efficiency = {
    textPosition: function (x, y, limit, reversed) {
        loc_a = (y > limit[1] / 2) ? 'bottom' : 'top';
        loc_b = (x > limit[0] / 2) ^ reversed ? 'left' : 'right';

        return `${loc_a} ${loc_b}`;
    },
    markerColor: function (x, y, limit, reversed) {
        let color = '#2f7ed8';
        if (reversed && (x < limit[0] / 2 && y > limit[1] / 2)) {
            color = '#ff0000';
        } else if (!reversed && (x > limit[0] / 2 && y > limit[1] / 2)) {
            color = '#ff0000';
        }
        return color;
    },
    parseStore: function (input, xStatistic, yStatistic, reversed, includeLabels, config) {
        const x = input[xStatistic];
        const y = input[yStatistic];

        const xAxisMax = Math.max(100.0, input.max[xStatistic]);
        const yAxisMax = input.max[yStatistic];

        const limit = [xAxisMax, yAxisMax];

        const markerColors = [];
        const textPosition = [];
        for (let i = 0; i < input.data[xStatistic].length; i++) {
            const color = XDMoD.utils.efficiency.markerColor(input.data[xStatistic][i], input.data[yStatistic][i], limit, reversed);
            markerColors.push(color);
            const posn = XDMoD.utils.efficiency.textPosition(input.data[xStatistic][i], input.data[yStatistic][i], limit, reversed);
            textPosition.push(posn);
        }

        const anonMarkerColors = [];
        for (let i = 0; i < input.anon_data[xStatistic].length; i++) {
            const color = XDMoD.utils.efficiency.markerColor(input.anon_data[xStatistic][i], input.anon_data[yStatistic][i], limit, reversed);
            anonMarkerColors.push(color);
        }

        // Add cross hairs to start so they are below the scatter markers
        const data = [{
            x: [Math.ceil(xAxisMax / 2), Math.ceil(xAxisMax / 2)],
            y: [0, yAxisMax],
            mode: 'lines',
            hoverinfo: 'skip',
            line: {
                color: 'black',
                width: 1
            }
        }, {
            x: [0, xAxisMax],
            y: [Math.ceil(yAxisMax / 2), Math.ceil(yAxisMax / 2)],
            mode: 'lines',
            hoverinfo: 'skip',
            line: {
                color: 'black',
                width: 1
            }
        },{
            x: input.anon_data[xStatistic],
            y: input.anon_data[yStatistic],
            type: 'scatter',
            mode: 'markers',
            hovertemplate: ` User (Access denied to view name)<br /> ${config.statisticLabels[0]}: <b>%{x:.0f} %</b> <br /> ${config.statisticLabels[1]}: <b>%{y:.0f} ${config.valueLabels[1]}</b><extra></extra>`,
            marker: {
                opacity:0.75,
                size: 8,
                color: anonMarkerColors
            }
        }, {
            x: input.data[xStatistic],
            y: input.data[yStatistic],
            text: input.data.person_name,
            type: 'scatter',
            mode: includeLabels ? 'markers+text' : 'markers',
            hovertemplate: `<b> %{text}</b><br /> ${config.statisticLabels[0]}: <b>%{x:.0f} %</b> <br /> ${config.statisticLabels[1]}: <b>%{y:.0f} ${config.valueLabels[1]}</b><extra></extra>`,
            textposition: textPosition,
            customdata: input.data.person_id,
            marker: {
                size: 11,
                color: markerColors,
                line: {
                    color: 'black',
                    width: 2
                }
            }
        }];

        return [data, xAxisMax, yAxisMax];
    }
};

XDMoD.Module.Efficiency = Ext.extend(XDMoD.PortalModule, {
    // Portal Module Properties
    title: 'Efficiency',
    module_id: 'efficiency',
    analytics: null,

    // Portal Module Toolbar Config
    usesToolbar: true,
    toolbarItems: {
        durationSelector: {
            enable: true,
            config: {
                defaultCannedDateIndex: 2
            }
        }
    },

    initComponent: function () {
        var self = this;

        // Container for the analytic card display
        var analyticCardPanel = new Ext.Panel({
            itemId: 'analytic_card_panel',
            border: false,
            frame: false,
            autoScroll: true
        });

        // Efficiency tab main panel with card layout to allow for switching between views
        var mainPanel = new Ext.Panel({
            itemId: 'efficiency_display_panel',
            frame: false,
            layout: 'card',
            border: false,
            activeItem: 0,
            region: 'center',
            items: [
                analyticCardPanel
            ]
        });

        // Get the analytics that will be displayed
        Ext.Ajax.request({
            url: XDMoD.REST.url + '/efficiency/analytics',
            method: 'GET',
            params: {
                token: XDMoD.REST.token
            },
            callback: function (o, success, response) {
                if (success) {
                    var analytics = JSON.parse(response.responseText);
                    self.analytics = analytics;
                    self.getAnalyticCardDisplay(analytics);
                }
            },
            failure: function (response) {
                Ext.Msg.alert(
                    response.statusText || 'Analytics Not Found',
                    JSON.parse(response.responseText).message || 'Analytics not found. Please contact system administrator to troubleshoot error.'
                );
            }
        });

        // Handle duration change for each active item
        self.on('duration_change', function () {
            var activeItem = mainPanel.getLayout().activeItem;
            var activeItemIndex = mainPanel.items.indexOf(activeItem);

            // Active item is analytic cards view
            if (activeItemIndex === 0) {
                self.reloadCharts(self.analytics);
            } else if (activeItemIndex === 1) {
                // Active item is scatter plot or drilldown histogram view
                var analytic = activeItem.config.analytic;
                activeItem = Ext.getCmp('detailed_analytic_panel_' + analytic).getLayout().activeItem;
                activeItemIndex = Ext.getCmp('detailed_analytic_panel_' + analytic).items.indexOf(activeItem);

                var scatterPlotPanel = Ext.getCmp('analytic_scatter_plot_' + analytic);

                var filterObj = {};

                // Active item is scatter plot
                if (activeItemIndex === 0) {
                    var id = mainPanel.getLayout().activeItem.id;
                    var analyticPanel = Ext.getCmp(id);
                    var analyticConfig = analyticPanel.config;

                    // If filters have been applied, keep applied
                    if (scatterPlotPanel.aggFilters) {
                        var dimensionObj = {};
                        var dimension;
                        for (dimension in scatterPlotPanel.aggFilters) {
                            if (scatterPlotPanel.aggFilters.hasOwnProperty(dimension)) {
                                var filterValues = [];

                                for (var i = 0; i < scatterPlotPanel.aggFilters[dimension].length; i++) {
                                    filterValues.push(scatterPlotPanel.aggFilters[dimension][i].filterId);
                                }

                                dimensionObj[dimension] = filterValues;
                                jQuery.extend(filterObj, dimensionObj);
                            }
                        }
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
                                    field: analyticConfig.statistics[1],
                                    dirn: 'desc'
                                },
                                filters: filterObj,
                                statistics: analyticConfig.statistics
                            })
                        }
                    });
                } else if (activeItemIndex === 1) {
                    // Active item is drilldown histogram
                    var store = Ext.StoreMgr.lookup('histogram_chart_store_' + analytic);
                    var hcPanel = Ext.getCmp('hc-panel-' + analytic);
                    var person = hcPanel.person;
                    var personId = hcPanel.personId;

                    // If filters have applied, keep applied
                    var filters;
                    if (scatterPlotPanel.jobListFilters) {
                        filters = scatterPlotPanel.jobListFilters.slice();
                        filters.push({
                            dimension_id: 'person',
                            id: 'person=' + personId,
                            realms: ['SUPREMM'],
                            value_id: personId,
                            value_name: person,
                            checked: true
                        });

                        // Format filter as needed for ME
                        filterObj = {
                            data: filters,
                            total: filters.length
                        };
                    } else {
                    // If no filters applied, keep filtering on person
                        filters = [{
                            dimension_id: 'person',
                            id: 'person=' + personId,
                            realms: ['SUPREMM'],
                            value_id: personId,
                            value_name: person,
                            checked: true
                        }];

                        filterObj = {
                            data: filters,
                            total: filters.length
                        };
                    }

                    store.baseParams.start_date = Ext.getCmp('efficiency').getDurationSelector().getStartDate().format('Y-m-d');
                    store.baseParams.end_date = Ext.getCmp('efficiency').getDurationSelector().getEndDate().format('Y-m-d');

                    store.baseParams.global_filters = encodeURIComponent(Ext.util.JSON.encode(filterObj));
                    store.reload();
                }
            }
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
        var self = this;

        var breadcrumbMenu = {
            xtype: 'buttongroup',
            id: 'breadcrumb_btns',
            frame: false,
            items: [
                { xtype: 'tbtext', text: 'Navigation: ' },
                {
                    xtype: 'button',
                    text: 'Analytic Cards',
                    itemId: 'analytic_breadcrumb_btn',
                    disabled: true,
                    iconCls: 'btn_dashboard',
                    handler: function () {
                        // Display card view and remove panel for scatterplot/drilldown view
                        var mainPanel = self.getComponent('efficiency_display_panel');
                        mainPanel.layout.setActiveItem(0);
                        mainPanel.doLayout();
                        mainPanel.remove(mainPanel.items.items[1], true);

                        // Disable this button when in analytic card view
                        this.disable();

                        // Remove all other links in breadcrumb menu
                        var breadcrumbBtns = Ext.getCmp('breadcrumb_btns');
                        var length = breadcrumbBtns.items.length;
                        for (var i = 2; i < length; i++) {
                            breadcrumbBtns.remove(2);
                        }
                        breadcrumbBtns.doLayout();
                    }
                }]
        };

        return [
            XDMoD.ToolbarItem.DURATION_SELECTOR,
            breadcrumbMenu
        ];
    },

    analyticCardTemplate: [
        // Template for creating cards for each analytic
        '<div class="analyticCardContents">',
        '<div class="analyticHeader">',
        '<h1>{title}</h1>',
        '<p>{description}</p>',
        '</div>',
        '<div class="analyticScatterPlotThumbnail" id="{analytic}Chart"></div>',
        '</div>'
    ],

    getAnalyticCardDisplay: function (data) {
        var self = this;
        var analtyicCardPanel = self.getComponent('efficiency_display_panel').getComponent('analytic_card_panel');

        // Add container for each type of analytic
        for (var i = 0; i < data.data.length; i++) {
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

            // Add the analytic card to the analytic type container
            for (var j = 0; j < analytics.length; j++) {
                var analyticCard = new Ext.Panel({
                    id: 'analytic_card_' + analytics[j].analytic,
                    frame: false,
                    border: false,
                    data: analytics[j],
                    tpl: self.analyticCardTemplate,
                    cls: 'analyticCard',
                    listeners: {
                        afterrender: function (component) {
                            // Get the scatter plot for the analytic
                            self.getAnalyticPlots(component.initialConfig.data);

                            // Add listener so user can see detailed view of analytic when card is clicked
                            var el = component.getEl();
                            el.on('click', function () {
                                self.showAnalyticPanel(component.initialConfig.data);
                            });

                            el.mask('Loading');
                        }
                    }
                });
                typePanel.add(analyticCard);
            }
            analtyicCardPanel.add(typePanel);
        }

        analtyicCardPanel.doLayout();
    },

    // Config parameter is the analytic and associated information needed to populate scatter plot and drilldown chart
    getAnalyticPlots: function (config) {
        var self = this;

        // Get the statistics that will be shown in the scatter plot
        const xStatistic = config.statistics[0];
        const yStatistic = config.statistics[1];

        var analyticStore = new Ext.data.JsonStore({
            storeId: 'analytic_store_' + config.analytic,
            restful: true,
            url: XDMoD.REST.url + '/efficiency/groupedData',
            root: 'results',
            autoLoad: true,
            baseParams: {
                start: 0,
                limit: 3000,
                config: JSON.stringify({
                    realm: config.realm,
                    group_by: 'person',
                    aggregation_unit: 'day',
                    start_date: Ext.getCmp('efficiency').getDurationSelector().getStartDate(),
                    end_date: Ext.getCmp('efficiency').getDurationSelector().getEndDate(),
                    order_by: {
                        field: config.statistics[1],
                        dirn: 'desc'
                    },
                    filters: [],
                    statistics: config.statistics
                })
            },
            fields: [xStatistic, yStatistic],
            listeners: {
                exception: function (proxy, type, action, exception, response) {
                    const card = Ext.get(`analytic_card_${config.analytic}`);
                    card.unmask();

                    var details = Ext.decode(response.responseText);
                    document.getElementById(config.analytic + 'Chart').innerHTML = '<div class="analyticInfoError">Error: ' + response.status + ' (' + response.statusText + ')<br>Details: ' + details.message + '</div>';
                },
                load: function () {
                    const card = Ext.get(`analytic_card_${config.analytic}`);
                    card.unmask();

                    const result = analyticStore.data.items[0].json;

                    if (result.count > 0) {

                        const [data, xAxisMax, yAxisMax] = XDMoD.utils.efficiency.parseStore(result, xStatistic, yStatistic, config.reversed, false, config);

                        console.log(xAxisMax, yAxisMax);

                        const overlapRatio = 0.03;
                        let xrange = [-1.0 * xAxisMax * overlapRatio, xAxisMax * (1.0 + overlapRatio)];
                        if (config.reversed) {
                            xrange = [xrange[1], xrange[0]];
                        }

                        const layout = {
                            font: {
                                family: '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif'
                            },
                            paper_bgcolor: '#f8f7f7',
                            plot_bgcolor: '#f8f7f7',
                            cliponaxis: false,
                            xaxis: {
                                title: config.statisticLabels[0],
                                color: '#707070',
                                titlefont: {
                                    size: 12
                                },
                                zerolinecolor: '#d8d8d8',
                                dtick: Math.ceil(xAxisMax / 4),
                                tick0: 0,
                                gridcolor: '#d8d8d8',
                                range: xrange,
                                tickfont: {
                                    size: 11
                                }
                            },
                            yaxis: {
                                title: config.statisticLabels[1],
                                color: '#707070',
                                titlefont: {
                                    size: 12
                                },
                                zerolinecolor: '#d8d8d8',
                                dtick: Math.ceil(yAxisMax / 4),
                                tick0: 0,
                                gridcolor: '#d8d8d8',
                                range: [-1.0 * overlapRatio * yAxisMax, yAxisMax * (1.0 + overlapRatio)],
                                tickfont: {
                                    size: 11
                                }
                            },
                            showlegend: false,
                            margin: {
                                t: 0,
                                b: 55,
                                l: 65,
                                r: 10
                            }
                        };

                        const pconf = {
                            displayModeBar: false,
                            staticPlot: true
                        };

                        Plotly.newPlot(`${config.analytic}Chart`, data, layout, pconf);
                    } else {
                        document.getElementById(config.analytic + 'Chart').innerHTML = "<div class='analyticInfoError'> No data available during this time frame for this analytic.";
                    }
                }
            }
        });
    },

    reloadCharts: function (data) {
        // Reload each chart with new start and end date
        for (var i = 0; i < data.data.length; i++) {
            var analytics = data.data[i].analytics;
            for (var j = 0; j < analytics.length; j++) {
                const card = Ext.get('analytic_card_' + analytics[j].analytic);
                card.mask('Loading');
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
                                field: analytics[j].statistics[1],
                                dirn: 'desc'
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
        var self = this;

        var analyticPanel = new XDMoD.Module.Efficiency.AnalyticPanel({
            config: chartConfig
        });

        // Add new breadcrumb for the scatter plot
        var btn = {
            xtype: 'button',
            text: chartConfig.title,
            id: chartConfig.analytic + '_breadcrumb_btn',
            disabled: true,
            iconCls: 'scatter',
            handler: function () {
                // Display the scatter plot panel and remove the drilldown histogram panel
                var scatterPlotPanel = Ext.getCmp('detailed_analytic_panel_' + chartConfig.analytic);
                scatterPlotPanel.layout.setActiveItem(0);
                scatterPlotPanel.doLayout();
                scatterPlotPanel.remove(scatterPlotPanel.items.items[1], true);

                // Remove any stored filters for drilldown plot
                Ext.getCmp('analytic_scatter_plot_' + chartConfig.analytic).jobListFilters = null;

                // Remove all other links in breadcrumb menu
                var breadcrumbMenu = Ext.getCmp('breadcrumb_btns');
                var length = breadcrumbMenu.items.length;
                var i;
                for (i = 4; i < length; i++) {
                    breadcrumbMenu.remove(4);
                }
                breadcrumbMenu.doLayout();

                // Update help text if alternative histogram text is available
                if (chartConfig.histogram.histogramHelpText) {
                    var helpText = Ext.getCmp('helpText');
                    helpText.update(chartConfig.documentation);
                    helpText.ownerCt.doLayout();
                }

                // Update the description panel to match the chart being shown
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
                    comments: chartConfig.statisticDescription,
                    subnotes: ''
                });


                // Update the filter check boxes to reflect what was checked previously prior to navigating to the histogram
                var dimensions = ['Queue', 'Application', 'Resource', 'PI'];
                var filters = Ext.getCmp('analytic_scatter_plot_' + chartConfig.analytic).aggFilters;
                var fieldSet;

                for (i = 0; i < dimensions.length; i++) {
                    // Remove all checks from drilldown view and reset filtersChecked object to be populated by what was previously applied in scatter plot view
                    var checkboxGroup = Ext.getCmp('checkbox_group' + dimensions[i]).getValue();
                    var j;
                    for (j = 0; j < checkboxGroup.length; j++) {
                        checkboxGroup[j].setValue(false);
                    }

                    fieldSet = Ext.getCmp(dimensions[i] + '_field_set');
                    fieldSet.filtersChecked = [];

                    // Check all filters that were applied prior to navigating to the histogram - these are stored in the aggregate filter variable in the scatter plot panel
                    for (var key in filters) {
                        if (Object.prototype.hasOwnProperty.call(filters, key)) {
                            var values = filters[key];
                            if (key === dimensions[i].toLowerCase()) {
                                fieldSet.filtersChecked = values;

                                var k;
                                for (k = 0; k < values.length; k++) {
                                    Ext.getCmp('checkbox_group' + dimensions[i]).setValue(values[k].id, true);
                                }
                            }
                        }
                    }
                }

                // Disable this btn on showing the scatter plot
                this.disable();
            }
        };

        // Add new spacer and scatter plot button
        var breadcrumbMenu = Ext.getCmp('breadcrumb_btns');
        breadcrumbMenu.add({ xtype: 'tbtext', text: '&#10142' });
        breadcrumbMenu.add(btn);
        breadcrumbMenu.doLayout();

        // Enable breadcrumb btn that navigates to analytic card view
        breadcrumbMenu.getComponent('analytic_breadcrumb_btn').enable();

        // Load new panel with corresponding analytic chart
        var mainPanel = self.getComponent('efficiency_display_panel');
        mainPanel.add(analyticPanel);
        mainPanel.layout.setActiveItem(1);
        mainPanel.doLayout();
    }
});
