Ext.namespace('XDMoD.Module.Efficiency.AnalyticPanel');
/*
This component builds the panel that is used to display the scatter plot and further information about a specific analytic.
*/
XDMoD.Module.Efficiency.AnalyticPanel = Ext.extend(Ext.Panel, {
    region: 'center',
    border: true,
    layout: 'border',

    initComponent: function () {
        var self = this;

        this.items = [
            self.getComponents()
        ];

        XDMoD.Module.Efficiency.AnalyticPanel.superclass.initComponent.apply(this, arguments);
    },

    getComponents: function () {
        var self = this;

        var filterPanel = new XDMoD.Module.Efficiency.FilterPanel({
            config: self.config,
            region: 'west',
            title: 'Filters',
            collapsible: true,
            collapsed: false,
            autoScroll: true,
            split: true,
            plugins: new Ext.ux.collapsedPanelTitlePlugin(),
            width: 300
        });

        var detailedAnalyticPanel = new Ext.Panel({
            id: 'detailed_analytic_panel_' + self.config.analytic,
            layout: 'card',
            activeItem: 0,
            split: true,
            autoScroll: true,
            region: 'center',
            border: false,
            items: [
                new XDMoD.Module.Efficiency.ScatterPlotPanel({
                    id: 'analytic_scatter_plot_' + self.config.analytic,
                    config: self.config,
                    border: false,
                    boxMinWidth: 800,
                    boxMinHeight: 600,
                    autoScroll: true,
                    panelSettings: {
                        url: XDMoD.REST.url + '/efficiency/scatterPlot/' + self.config.analytic,
                        baseParams: {
                            start: 0,
                            limit: 3000,
                            config: JSON.stringify({
                                realm: 'SUPREMM',
                                group_by: 'person',
                                aggregation_unit: 'day',
                                start_date: Ext.getCmp('efficiency').getDurationSelector().getStartDate(),
                                end_date: Ext.getCmp('efficiency').getDurationSelector().getEndDate(),
                                order_by: {
                                    field: self.config.field,
                                    dirn: 'asc'
                                },
                                filters: [],
                                mandatory_filters: self.config.mandatoryFilters,
                                statistics: self.config.statistics
                            })
                        }
                    }
                })

            ]
        });

        // Panel above scatter plot/drill down histogram to show information about analytic and improving behavior
        var details = new Ext.Panel({
            region: 'north',
            border: false,
            html: self.config.documentation
        });

        // South panel to show detailed information about the statistics being shown
        var descriptionPanel = new Ext.Panel({
            id: 'descriptionPanel',
            region: 'south',
            autoScroll: true,
            collapsible: true,
            split: true,
            border: false,
            title: 'Description',
            layout: 'fit',
            height: 100,
            plugins: [new Ext.ux.collapsedPanelTitlePlugin()]
        });

        return [
            filterPanel,
            new Ext.Panel({
                region: 'center',
                layout: 'border',
                items: [details, detailedAnalyticPanel,
                    descriptionPanel]

            })

        ];
    }
});
