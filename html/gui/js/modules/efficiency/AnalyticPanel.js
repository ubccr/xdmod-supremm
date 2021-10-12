Ext.namespace('XDMoD.Module.Efficiency.AnalyticPanel');
/*
This component builds the panel that is used to display the scatter plot and further information about a specific analytic. 
*/
XDMoD.Module.Efficiency.AnalyticPanel = Ext.extend(Ext.Panel, {
    id: 'analytic_panel',
    autoScroll: true,
    region: 'center',

    initComponent: function () {
        var self = this;

        self.setTitle(self.config.analytic)

        //Add search panel here 

        //Add analytic scatter plot panel here 

        this.items = [
            //searchPanel
            //analyticScatterPlotPanel
        ]

        // FINISH: the component creation by calling our superclass' initComponent.
        XDMoD.Module.Efficiency.AnalyticPanel.superclass.initComponent.apply(this, arguments);
    }
})