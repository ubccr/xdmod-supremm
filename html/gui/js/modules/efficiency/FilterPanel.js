Ext.namespace('XDMoD.Module.Efficiency.FilterPanel');
/*
This component builds the panel that is used to display the filters for the analytic/drilldown plots.
*/
XDMoD.Module.Efficiency.FilterPanel = Ext.extend(Ext.Panel, {
    dimensions: ['Queue', 'Application', 'Resource', 'PI'],

    initComponent: function () {
        this.items = [
            this.getComponents(this.dimensions)
        ];

        XDMoD.Module.Efficiency.FilterPanel.superclass.initComponent.apply(this, arguments);
    },

    getComponents: function (dimensionList) {
        var self = this;

        var items = [];

        items.push({
            xtype: 'buttongroup',
            itemId: 'button_group',
            border: false,
            frame: false,
            width: 300,
            cls: 'btnGroup',
            items: [
                {
                    xtype: 'button',
                    itemId: 'apply_filters_btn',
                    text: 'Apply Filters to Chart',
                    cls: 'filterApplyBtn',
                    disabled: true,
                    handler: function () {
                        // Enable the remove filters btn when filters have been applied
                        this.ownerCt.getComponent('remove_filters_btn').enable();

                        // Set the variables needed to keep track of filtering between charts
                        var subtitle = '';
                        var aggFilters = {};
                        var MEFilters = [];
                        var filterObj = {};

                        for (var i = 0; i < dimensionList.length; i++) {
                            var filterValues = [];
                            // Check each fieldset for filters that a user intends to apply
                            var fieldSet = Ext.getCmp(dimensionList[i] + '_field_set');
                            var checkedFilters = fieldSet.filtersChecked;
                            if (checkedFilters.length > 0) {
                                var dimension = dimensionList[i].toLowerCase();
                                var filterSubtitle = '';
                                // Add all filters that are checked in the fieldset for each dimension to a filter object
                                for (var j = 0; j < checkedFilters.length; j++) {
                                    // Add filter to filter list
                                    filterValues.push(checkedFilters[j].filterId);

                                    // Update the string that will be used for chart subtitle
                                    filterSubtitle += checkedFilters[j].name;
                                    if (j < checkedFilters.length - 1) {
                                        filterSubtitle += ', ';
                                    }

                                    // Create the ME filter object and add to ME filter array
                                    var filterME = {
                                        dimension_id: dimension,
                                        id: dimension + '=' + checkedFilters[j].filterId,
                                        realms: ['SUPREMM'],
                                        value_id: checkedFilters[j].filterId,
                                        value_name: checkedFilters[j].name,
                                        checked: true
                                    };
                                    MEFilters.push(filterME);
                                }

                                // Add filters for each dimension to the filterObj to be applied to the scatter plot
                                var dimensionObj = {};
                                dimensionObj[dimension] = filterValues;
                                jQuery.extend(filterObj, dimensionObj);

                                // Add filters for each dimension to the aggFilters object for keeping track of filtering on breadcrumb navigation
                                var aggDimensionObj = {};
                                aggDimensionObj[dimension] = checkedFilters;
                                jQuery.extend(aggFilters, aggDimensionObj);

                                subtitle += dimensionList[i] + ': ' + filterSubtitle + ' <br> ';
                            }
                        }

                        var activeItem = Ext.getCmp('detailed_analytic_panel_' + self.config.analytic).getLayout().activeItem;
                        var activeItemIndex = Ext.getCmp('detailed_analytic_panel_' + self.config.analytic).items.indexOf(activeItem);
                        var analyticScatterPlot = Ext.getCmp('analytic_scatter_plot_' + self.config.analytic);

                        // Apply filters for scatter plot
                        if (activeItemIndex === 0) {
                            // Keep track of filters applied to the scatter plot
                            analyticScatterPlot.aggFilters = aggFilters;
                            analyticScatterPlot.MEFilters = MEFilters;
                            analyticScatterPlot.jobListFilters = MEFilters;

                            // Reload store with new filters applied
                            analyticScatterPlot.store.reload({
                                params: {
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
                                        filters: filterObj,
                                        mandatory_filters: self.config.mandatoryFilters,
                                        statistics: self.config.statistics
                                    })
                                }
                            });

                            // Update subtitle
                            analyticScatterPlot.subtitle = subtitle;
                        } else if (activeItemIndex === 1) {
                        // Apply filters to drilldown chart
                            analyticScatterPlot.jobListFilters = MEFilters;
                            var store = Ext.StoreMgr.lookup('histogram_chart_store_' + self.config.analytic);
                            var hcPanel = Ext.getCmp('hc-panel-' + self.config.analytic);
                            var person = hcPanel.person;
                            var personId = hcPanel.personId;

                            // Use ME filter object formatting with person added as a filter
                            filterObj = MEFilters.slice();

                            filterObj.push({
                                dimension_id: 'person',
                                id: 'person=' + personId,
                                realms: ['SUPREMM'],
                                value_id: personId,
                                value_name: person,
                                checked: true
                            });

                            var filters = {
                                data: filterObj,
                                total: filterObj.length
                            };

                            store.baseParams.global_filters = encodeURIComponent(Ext.util.JSON.encode(filters));
                            store.reload();
                        }
                    }
                },
                {
                    xtype: 'button',
                    text: 'Remove Filters from Chart',
                    itemId: 'remove_filters_btn',
                    disabled: true,
                    cls: 'filterApplyBtn',
                    handler: function () {
                        // Remove any boxes that are checked
                        for (var i = 0; i < dimensionList.length; i++) {
                            var fieldSet = Ext.getCmp(dimensionList[i] + '_field_set');
                            fieldSet.filtersChecked = [];

                            var checkboxGroup = Ext.getCmp('checkbox_group' + dimensionList[i]).getValue();
                            for (var j = 0; j < checkboxGroup.length; j++) {
                                checkboxGroup[j].setValue(false);
                            }
                        }

                        var activeItem = Ext.getCmp('detailed_analytic_panel_' + self.config.analytic).getLayout().activeItem;
                        var activeItemIndex = Ext.getCmp('detailed_analytic_panel_' + self.config.analytic).items.indexOf(activeItem);
                        var analyticScatterPlot = Ext.getCmp('analytic_scatter_plot_' + self.config.analytic);

                        if (activeItemIndex === 0) {
                            analyticScatterPlot.subtitle = 'No filters applied.';

                            analyticScatterPlot.aggFilters = null;
                            analyticScatterPlot.MEFilters = null;
                            analyticScatterPlot.jobListFilters = null;

                            // Reload scatter plot store with only filters that are applied initially
                            analyticScatterPlot.store.reload({
                                params: {
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
                                        filters: [],
                                        mandatory_filters: self.config.mandatoryFilters,
                                        statistics: self.config.statistics
                                    })
                                }
                            });
                        } else if (activeItemIndex === 1) {
                            analyticScatterPlot.jobListFilters = null;

                            var store = Ext.StoreMgr.lookup('histogram_chart_store_' + self.config.analytic);
                            var hcPanel = Ext.getCmp('hc-panel-' + self.config.analytic);
                            var person = hcPanel.person;
                            var personId = hcPanel.personId;

                            var personFilter = [{
                                dimension_id: 'person',
                                id: 'person=' + personId,
                                realms: ['SUPREMM'],
                                value_id: personId,
                                value_name: person,
                                checked: true
                            }];

                            var filters = {
                                data: personFilter,
                                total: 1
                            };

                            store.baseParams.global_filters = encodeURIComponent(Ext.util.JSON.encode(filters));
                            // Reload drilldown chart store with only person filter applied
                            store.reload();
                        }
                    }
                }]
        }
        );

        // Add fieldset or access denied message to Filter Panel items
        for (var i = 0; i < dimensionList.length; i++) {
            var fieldSet = this.getFieldSet(dimensionList[i]);

            if (fieldSet) {
                items.push(fieldSet);
            } else {
                var filterMessage = new Ext.Container({
                    html: '<div> You do not have permission to view ' + dimensionList[i] + ' filters.'
                });
                items.push(filterMessage);
            }
        }
        return items;
    },

    updateFilterList: function (button, store, newStoreLimit, newText) {
        // Reload store with new limit set
        store.reload({
            params: {
                start: 0,
                limit: newStoreLimit
            }
        });

        // Show button as loading
        button.setText('<img src="/gui/images/loading.gif">');
        button.disable();

        store.on('load', function (t, op) {
            // Update btn text and enable
            button.setText(newText);
            button.enable();
        }, button);
    },

    getFieldSet: function (dimension) {
        var self = this;
        var fieldSet = null;

        var store = new Ext.data.JsonStore({
            url: 'controllers/metric_explorer.php',
            fields: ['checked', 'name', 'id'],
            root: 'data',
            totalProperty: 'totalCount',
            autoLoad: true,
            idProperty: 'name',
            messageProperty: 'message',
            baseParams: {
                operation: 'get_dimension',
                dimension_id: dimension.toLowerCase(),
                realm: 'SUPREMM',
                start: 0,
                limit: 5,
                public_user: CCR.xdmod.publicUser
            },
            listeners: {
                exception: function (proxy, type, action, exception, response) {
                    var fieldSetErrorMessage = new Ext.Container({ html: '<div> There was an error loading ' + dimension + ' filters. <br> Error Message: ' + response.message });
                    fieldSet.removeAll();
                    fieldSet.insert(0, fieldSetErrorMessage);
                    fieldSet.doLayout();
                },
                load: function (response) {
                    if (this.data.items.length > 0) {
                        // Removes prior checkbox group when store is reloaded (show more/fewer filters)
                        if (Ext.getCmp('checkbox_group' + dimension)) {
                            fieldSet.remove(Ext.getCmp('checkbox_group' + dimension));
                        }

                        var filters = response.data.items;

                        var checkBoxes = [];
                        for (var i = 0; i < filters.length; i++) {
                            // Handles formatting in situation where filter is missing a name property (Queue dimension)
                            if (!filters[i].data.name) {
                                filters[i].data.name = '  ';
                            }

                            var checkBox = {
                                xtype: 'checkbox',
                                id: filters[i].data.id + '_' + dimension,
                                filterId: filters[i].data.id,
                                name: filters[i].data.name,
                                boxLabel: filters[i].data.name,
                                listeners: {
                                    scope: this,
                                    check: function (checkbox, checked) {
                                        self.onCheck(checkbox, checked, dimension);
                                    }
                                }
                            };

                            checkBoxes.push(checkBox);
                        }

                        var checkboxGroup = new Ext.form.CheckboxGroup({
                            id: 'checkbox_group' + dimension,
                            columns: 1,
                            items: checkBoxes
                        });

                        fieldSet.insert(1, checkboxGroup);
                        fieldSet.doLayout();

                        // Handle button text depnding on length of filter list
                        if (this.totalLength < 5 || this.totalLength === 5) {
                            fieldSet.getComponent('show_filters_btn_' + dimension).destroy();
                        } else if (this.totalLength > 5 && (this.totalLength < 15 || this.totalLength === 15)) {
                            fieldSet.getComponent('show_filters_btn_' + dimension).setText('Show Remaining ' + dimension + ' Filters');
                        } else if (this.totalLength > 15) {
                            fieldSet.getComponent('show_filters_btn_' + dimension).setText('Show More ' + dimension + ' Filters');
                        }
                    } else {
                        var fieldSetErrorMessage = new Ext.Container({ html: '<div> Access denied for this filter. </div>' });
                        fieldSet.removeAll();
                        fieldSet.insert(0, fieldSetErrorMessage);
                        fieldSet.doLayout();
                    }
                }
            }
        });

        fieldSet = new Ext.form.FieldSet({
            title: 'Filter by ' + dimension,
            id: dimension + '_field_set',
            filtersChecked: [],
            width: 225,
            autoHeight: true,
            border: true,
            layout: 'anchor',
            collapsible: true,
            cls: 'filterFieldSet',
            items: [
                {
                    xtype: 'button',
                    text: '<img src="/gui/images/loading.gif">',
                    itemId: 'show_filters_btn_' + dimension,
                    handler: function () {
                        var filtersChecked = fieldSet.filtersChecked.slice();

                        if (store.baseParams.limit === 5 && store.totalLength > 15 && this.getText() === 'Show More ' + dimension + ' Filters') {
                            self.updateFilterList(this, store, 15, 'Show Remaining ' + dimension + ' Filters');
                        } else if (this.getText() === 'Show Remaining ' + dimension + ' Filters' || ((store.totalLength === 15 || store.totalLength < 15) && this.getText() === 'Show More ' + dimension + ' Filters')) {
                            self.updateFilterList(this, store, store.totalLength, 'Show Fewer ' + dimension + ' Filters');
                        } else if (this.getText() === 'Show Fewer ' + dimension + ' Filters') {
                            self.updateFilterList(this, store, 5, 'Show More ' + dimension + ' Filters');
                        }

                        // Update new filter checkbox list to check true on any previously checked filters
                        store.on('load', function (t, op) {
                            Ext.each(filtersChecked, function (f) {
                                Ext.getCmp('checkbox_group' + dimension).setValue(f.id, true);
                            });
                        }, this, { single: true });
                    }
                }
            ]
        });

        var comboBox = new Ext.form.ComboBox({
            emptyText: 'Search for ' + dimension.toLowerCase() + 's..',
            mode: 'local',
            typeAhead: true,
            triggerAction: 'all',
            selectOnFocus: true,
            displayField: 'name',
            valueField: 'id',
            width: 175,
            lazyRender: true,
            hideTrigger: true,
            store: new Ext.data.JsonStore({
                proxy: new Ext.data.HttpProxy({
                    url: XDMoD.REST.url + '/warehouse/dimensions/' + dimension.toLowerCase(),
                    method: 'GET'
                }),
                baseParams: {
                    realm: 'SUPREMM'
                },
                fields: ['checked', 'name', 'id'],
                root: 'results',
                totalProperty: 'totalCount',
                autoLoad: true,
                idProperty: 'name',
                messageProperty: 'message'
            }),
            listeners: {
                select: function (e) {
                    var filterId = e.value + '_' + dimension;
                    var checkbox_group = Ext.getCmp('checkbox_group' + dimension);

                    // Check filter if showing, if not showing show all filter checkboxes and check filter
                    if (checkbox_group.items.keys.includes(filterId)) {
                        checkbox_group.setValue(filterId, true);
                    } else {
                        var filtersChecked = fieldSet.filtersChecked.slice();

                        store.reload({
                            params: {
                                start: 0,
                                limit: store.totalLength
                            }
                        });

                        store.on('load', function (t, op) {
                            Ext.each(filtersChecked, function (f) {
                                Ext.getCmp('checkbox_group' + dimension).setValue(f.id, true);
                            });
                            Ext.getCmp('checkbox_group' + dimension).setValue(filterId, true);

                            fieldSet.getComponent('show_filters_btn_' + dimension).setText('Show Fewer ' + dimension + ' Filters');
                        }, this, { single: true });
                    }
                }
            }
        });

        fieldSet.insert(0, comboBox);
        fieldSet.doLayout();

        return fieldSet;
    },

    // Check handler for filter checkbox - handles enable/disable of apply filters btn
    onCheck: function (checkbox, checked, dimension) {
        var applyFiltersBtn = this.getComponent('button_group').getComponent('apply_filters_btn');
        var fieldSet = Ext.getCmp(dimension + '_field_set');
        var filtersChecked = fieldSet.filtersChecked.slice();

        if (checked) {
            applyFiltersBtn.enable();

            // Add filters that haven't already been added to teh filtersChecked object
            var filter = filtersChecked.find(function (object) {
                return object.id === checkbox.id;
            });

            if (!filter) {
                filtersChecked.push(checkbox);
                fieldSet.filtersChecked = filtersChecked;
            }
        } else {
            // Remove any filters that have been stored in the filtersChecked object
            var index = filtersChecked.findIndex(function (object) {
                return object.id === checkbox.id;
            });

            filtersChecked.splice(index, 1);
            fieldSet.filtersChecked = filtersChecked;

            var i;
            var filterCount = 0;
            for (i = 0; i < this.dimensions.length; i++) {
                fieldSet = Ext.getCmp(this.dimensions[i] + '_field_set');
                filterCount += fieldSet.filtersChecked.length;
            }

            if (filterCount === 0) {
                applyFiltersBtn.disable();
            }
        }
    }
});
