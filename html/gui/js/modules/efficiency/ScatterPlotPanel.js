Ext.namespace('XDMoD', 'XDMoD.Module', 'XDMoD.Module.Efficiency');

XDMoD.Module.Efficiency.ScatterPlotPanel = Ext.extend(Ext.Panel, {

    chart: null,
    store: null,
    displayTimezone: 'UTC',

    initComponent: function () {
        var self = this;

        XDMoD.Module.Efficiency.ScatterPlotPanel.superclass.initComponent.call(this, arguments);
    }
});
