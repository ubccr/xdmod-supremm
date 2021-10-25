Ext.namespace('XDMoD.Module.Efficiency.AnalyticPanel');
/*
This component builds the panel that is used to display the scatter plot and further information about a specific analytic.
*/
XDMoD.Module.Efficiency.AnalyticPanel = Ext.extend(Ext.Panel, {
    id: 'analytic_panel',
    autoScroll: true,
    region: 'center',
    border: true,
    layout: 'border',

    initComponent: function () {
        var self = this;

        this.items = [
            self.getComponents()
        ]

        XDMoD.Module.Efficiency.AnalyticPanel.superclass.initComponent.apply(this, arguments);
    },

    getComponents: function () {
        var self = this;

        var searchPanel = new Ext.Panel({
            region: 'west',
            title: 'Filters',
            width: 300
        });

        var analyticScatterPlot = new XDMoD.Module.Efficiency.ScatterPlotPanel({
            region: 'center',
            config: self.config,
            panelSettings: {
                url: XDMoD.REST.url + '/warehouse/aggregatedata',
                baseParams: {
                    start: 0,
                    limit: 1000,
                    config: JSON.stringify({
                        realm: self.config.realm,
                        group_by: 'person',
                        aggregation_unit: 'day',
                        start_date: Ext.getCmp('efficiency').getDurationSelector().getStartDate(),
                        end_date: Ext.getCmp('efficiency').getDurationSelector().getEndDate(),
                        order_by: {
                            field: self.config.field,
                            dirn: 'asc'
                        },
                        statistics: self.config.statistics
                    })
                }
            }
        });

        var descriptionPanel = new Ext.Panel({
            region: 'south',
            height: 200,
            title: 'Chart Description'
        });

        return [
            searchPanel,
            analyticScatterPlot,
            descriptionPanel
        ];
    }
})
