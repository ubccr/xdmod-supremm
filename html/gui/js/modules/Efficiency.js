/**
 * XDMoD.Module.Efficiency
 *
 */

XDMoD.Module.Efficiency = Ext.extend(XDMoD.PortalModule, {

    title: 'Efficiency',
    module_id: 'efficiency',
    usesToolbar: true,
    toolbarItems: {
        printButton: true
    },
    initComponent: function () {
        var mainArea = new Ext.Panel({
            region: 'center',
            html: 'New Efficiency Tab'
        });// mainArea

        Ext.apply(this, {
            items: [
                mainArea
            ]
        });// Ext.apply

        XDMoD.Module.Efficiency.superclass.initComponent.apply(this, arguments);

    }, // initComponent
});// XDMoD.Module.Efficiency
