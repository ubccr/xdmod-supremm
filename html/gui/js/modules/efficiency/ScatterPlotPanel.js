Ext.namespace('XDMoD', 'XDMoD.Module', 'XDMoD.Module.Efficiency');

/**
 * @class XDMoD.Module.Efficiency.ScatterPlotPanel
 */

XDMoD.Module.Efficiency.ScatterPlotPanel = Ext.extend(Ext.Panel, {
    store: null,
    MEFilters: null,
    jobListFilters: null,
    subtitle: 'No filters applied.',

    initComponent: function () {
        var self = this;

        var storeSettings = {
            proxy: new Ext.data.HttpProxy({
                method: 'GET',
                url: this.panelSettings.url,
                listeners: {
                    exception: (proxy, type, action, options, response) => {
                        self.el.unmask();
                        var details = Ext.decode(response.responseText);
                        document.getElementById(`${self.id}ScatterPlot`).innerHTML = '<div class="analyticInfoError">Error: ' + response.status + ' (' + response.statusText + ')<br>Details: ' + details.message + '</div>';
                    }
                }
            }),
            baseParams: this.panelSettings.baseParams,
            autoLoad: false,
            root: 'results',
            fields: [
                self.config.statistics[0],
                self.config.statistics[1],
                'name'
            ],
            listeners: {
                beforeload: function () {
                    self.el.mask('Loading');
                },
                load: function (inst, records) {
                    self.el.unmask();

                    const xStatistic = self.config.statistics[0];
                    const yStatistic = self.config.statistics[1];
                    const result = records[0].json;

                    if (result.count > 0) {
                        const [data, xAxisMax, yAxisMax] = XDMoD.utils.efficiency.parseStore(result, xStatistic, yStatistic, self.config.reversed, true, self.config);

                        const overlapRatio = 0.01;
                        let xrange = [-1.0 * xAxisMax * overlapRatio, xAxisMax * (1.0 + overlapRatio)];
                        if (self.config.reversed) {
                            xrange = [xrange[1], xrange[0]];
                        }

                        const annotationConfig = XDMoD.utils.efficiency.getPlotAnnotationConfig(false, self.config.title, self.subtitle, self.getWidth(), self.getHeight());

                        const layout = {
                            hoverlabel: {
                                bgcolor: '#fafafa',
                                bordercolor: '#2f7ed8',
                                align: 'left',
                                namelength: -1,
                                font: {
                                    color: '#333333',
                                    family: 'Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif'
                                }
                            },
                            font: {
                                family: '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif'
                            },
                            xaxis: {
                                layer: 'below traces',
                                title: self.config.statisticLabels[0],
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
                                layer: 'below traces',
                                title: self.config.statisticLabels[1],
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
                            annotations: annotationConfig.annotations,
                            images: annotationConfig.images,
                            margin: annotationConfig.margin,
                            cliponaxis: false,
                            showlegend: false
                        };

                        const pconf = {
                            displayModeBar: false,
                            staticPlot: false
                        };

                        Plotly.newPlot(`${self.id}ScatterPlot`, data, layout, pconf);
                        const plotDiv = document.getElementById(`${self.id}ScatterPlot`);
                        plotDiv.on('plotly_click', (evt) => {
                            if (!evt.points[0].customdata) {
                                return;
                            }

                            // Add new breadcrumb for drilldown view
                            const breadcrumbMenu = Ext.getCmp('breadcrumb_btns');

                            const btn = {
                                xtype: 'button',
                                text: `${self.config.title} for ${evt.points[0].text}`,
                                disabled: true,
                                iconCls: 'chart'
                            };

                            breadcrumbMenu.add({ xtype: 'tbtext', text: '&#10142' });
                            breadcrumbMenu.add(btn);
                            breadcrumbMenu.doLayout();

                            // Enable scatter plot breadcrumb for navigation
                            const analyticBtn = Ext.getCmp(`${self.config.analytic}_breadcrumb_btn`);
                            analyticBtn.enable();

                            // Load the drilldown on person chart
                            self.getPersonChart(evt.points[0].text, evt.points[0].customdata);

                            // Store filters applied to drilldown chart in job list filters object
                            self.jobListFilters = self.MEFilters;
                        });
                    } else {
                        const layout = XDMoD.utils.efficiency.getPlotAnnotationConfig(true, self.config.title, self.subtitle, self.getWidth(), self.getHeight());
                        layout.font = {
                            family: '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif'
                        };
                        layout.xaxis = {
                            visible: false
                        };
                        layout.yaxis = {
                            visible: false
                        };
                        const pconf = {
                            displayModeBar: false,
                            staticPlot: true
                        };

                        Plotly.newPlot(`${self.id}ScatterPlot`, [], layout, pconf);
                    }

                    // Update the description panel to reflect the current statistics
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
                        comments: self.config.statisticDescription,
                        subnotes: ''
                    });

                    descriptionPanel.doLayout();
                }
            }
        };

        this.store = new Ext.data.JsonStore(storeSettings);

        this.layout = 'fit';
        this.items = [{
            xtype: 'container',
            id: this.id + 'ScatterPlot',
            listeners: {
                resize: () => {
                    if (self.store.getCount() > 0) {
                        const plotConf = XDMoD.utils.efficiency.getPlotAnnotationConfig(self.store.data.items[0].json.count === 0, self.config.title, self.subtitle, self.getWidth(), self.getHeight());

                        plotConf.width = self.getWidth();
                        plotConf.height = self.getHeight();

                        Plotly.relayout(`${self.id}ScatterPlot`, plotConf);
                    }
                },
                render: function () {
                    self.store.load();
                }
            }
        }];

        XDMoD.Module.Efficiency.ScatterPlotPanel.superclass.initComponent.call(this, arguments);
    },

    mask: function (message) {
        var viewer = CCR.xdmod.ui.Viewer.getViewer();

        if (!viewer.el) {
            return;
        }

        viewer.el.mask(message);
    },

    unmask: function () {
        var viewer = CCR.xdmod.ui.Viewer.getViewer();

        if (!viewer.el) {
            return;
        }

        // If a mask is present, but the mask should not be removed,
        // just remove the message in the mask.
        if (viewer.el.isMasked() && CCR.xdmod.ui.Viewer.dontUnmask) {
            viewer.el.mask();
            return;
        }

        viewer.el.unmask();
    },

    getPersonChart: function (person, personId) {
        var self = this;

        // Person filter is not stored in MEFilters, so need to add prior to setting filters on chart
        var filterObj;
        if (self.MEFilters == null) {
            filterObj = {
                data: [
                    {
                        dimension_id: 'person',
                        id: 'person=' + personId,
                        realms: ['SUPREMM'],
                        value_id: personId,
                        value_name: person,
                        checked: true
                    }
                ],
                total: 1
            };
        } else {
            var filterData = self.MEFilters.slice();

            filterData.push({
                dimension_id: 'person',
                id: 'person=' + personId,
                realms: ['SUPREMM'],
                value_id: personId,
                value_name: person,
                checked: true
            });

            filterObj = {
                data: filterData,
                total: filterData.length
            };
        }

        var baseParams = {
            show_title: 'y',
            title: self.config.histogram.title + ' for ' + person,
            timeseries: false,
            aggregation_unit: 'day',
            start_date: Ext.getCmp('efficiency').getDurationSelector().getStartDate().format('Y-m-d'),
            end_date: Ext.getCmp('efficiency').getDurationSelector().getEndDate().format('Y-m-d'),
            global_filters: filterObj,
            show_filters: true,
            show_warnings: true,
            show_remainder: false,
            start: 0,
            limit: 200,
            timeframe_label: 'Previous month',
            operation: 'get_data',
            data_series: [{
                id: self.randomInt(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
                metric: self.config.histogram.metric,
                category: self.config.realm,
                realm: self.config.realm,
                group_by: self.config.histogram.group_by,
                x_axis: true,
                log_scale: false,
                has_std_err: false,
                std_err: false,
                value_labels: false,
                display_type: 'column',
                line_type: 'Solid',
                line_width: 2,
                combine_type: 'side',
                sort_type: 'none',
                filters: {
                    data: [],
                    total: 0
                },
                ignore_global: false,
                long_legend: false,
                trend_line: false,
                color: 'auto',
                shadow: false,
                visibility: 'null',
                z_index: 0,
                enabled: true
            }],
            swap_xy: false,
            share_y_axis: false,
            hide_tooltip: false,
            show_guide_lines: true,
            scale: 1,
            format: 'hc_jsonstore',
            legend_type: 'off',
            controller_module: 'metric_explorer'
        };

        baseParams.global_filters = encodeURIComponent(Ext.util.JSON.encode(baseParams.global_filters));
        baseParams.data_series = encodeURIComponent(Ext.util.JSON.encode(baseParams.data_series));

        var chartStore = new CCR.xdmod.CustomJsonStore({
            id: 'histogram_chart_store_' + self.config.analytic,
            autoDestroy: false,
            autoLoad: true,
            root: 'data',
            totalProperty: 'totalCount',
            successProperty: 'success',
            messageProperty: 'message',
            fields: [
                'chart',
                'layout',
                'data',
                'credits',
                'title',
                'subtitle',
                'xAxis',
                'yAxis',
                'tooltip',
                'legend',
                'series',
                'plotOptions',
                'alignedLabels',
                'credits',
                'dimensions',
                'metrics',
                'exporting',
                'reportGeneratorMeta'
            ],
            baseParams: baseParams,
            proxy: new Ext.data.HttpProxy({
                method: 'GET',
                url: XDMoD.REST.url + '/efficiency/histogram/' + self.config.histogram.group_by,
                listeners: {
                    exception: function (proxy, type, action, options, response) {
                        self.el.unmask();

                        var responseMessage = CCR.xdmod.ui.extractErrorMessageFromResponse(response);
                        if (responseMessage === null) {
                            responseMessage = 'Unknown Error';
                        }
                        Ext.getCmp('hc-panel-' + self.config.analytic).displayError(
                            'An error occurred while loading the chart.',
                            responseMessage
                        );
                    }
                }
            }),
            listeners: {
                beforeload: function (e) {
                    self.el.mask('Loading...');
                },
                load: function (e) {
                    self.el.unmask();
                    const chartConfig = e.data.items[0].data;
                    if (chartConfig.data.length > 0) {
                        var chartWidth = Ext.getCmp('hc-panel-' + self.config.analytic).baseChartOptions.layout.width;
                        var chartHeight = Ext.getCmp('hc-panel-' + self.config.analytic).baseChartOptions.layout.height;
                        // Format data for histogram
                        const data = chartConfig.data[0];
                        data.hovertemplate = `${data.name}: <b>%{y:,.0f}</b><extra></extra>`;
                        // Format layout for histogram
                        const plotConf = XDMoD.utils.efficiency.getPlotAnnotationConfig(self.store.data.items[0].json.count === 0, self.config.title, self.subtitle, chartWidth, chartHeight, true);
                        plotConf.images[0].source = `gui/images/${self.config.histogram.arrowImg}`;
                        const layout = chartConfig.layout;
                        layout.xaxis.title = self.config.histogram.groupByTitle;
                        layout.yaxis.title = self.config.histogram.metricTitle;
                        layout.yaxis.exponentformat = 'SI';
                        layout.hovermode = 'x unified';
                        layout.annotations = [layout.annotations[0], layout.annotations[1], ...plotConf.annotations];
                        layout.images = plotConf.images;
                        layout.margin = plotConf.margin;

                        // Update help text if alternative histogram text is available
                        if (self.config.histogram.histogramHelpText) {
                            var helpText = Ext.getCmp('helpText');
                            helpText.update(self.config.histogram.histogramHelpText);
                            helpText.ownerCt.doLayout();
                        }

                        self.updateDescription(chartStore);
                    }
                    self.unmask();
                }
            }
        });

        var drilldownChartContainer = new Ext.Panel({
            layout: 'fit',
            border: false,
            autoScroll: false,
            items: [
                new CCR.xdmod.ui.PlotlyPanel({
                id: 'hc-panel-' + self.config.analytic,
                person: person,
                personId: personId,
                boxMinWidth: 600,
                boxMinHeight: 400,
                baseChartOptions: {
                    efficiency: true
                },
                store: chartStore,
                listeners: {
                    resize: (t, adjWidth, adjHeight, rawWidth, rawHeight) => {
                        if (self.store.getCount() > 0) {
                            const chartDiv = document.getElementById(`hc-panel-${self.config.analytic}`);
                            const width = Math.max(600, adjWidth);
                            const height = Math.max(400, adjHeight);
                            const plotConf = XDMoD.utils.efficiency.getPlotAnnotationConfig(self.store.data.items[0].json.count === 0, self.config.title, self.subtitle, width, height, true);
                            plotConf.images[0].source = `gui/images/${self.config.histogram.arrowImg}`;
                            const annotations = chartDiv._fullLayout.annotations;
                            if (annotations.length > 1) {
                                plotConf.annotations = [annotations[0], annotations[1], ...plotConf.annotations];
                            }
                            plotConf.width = width;
                            plotConf.height = height;

                            Plotly.relayout(`hc-panel-${self.config.analytic}`, plotConf);
                        }
                    },
                    afterrender: () => {
                        const chartDiv = document.getElementById('hc-panel-' + self.config.analytic);
                        if (chartDiv) {
                            chartDiv.on('plotly_click', (evt) => {
                                if (evt.points.length > 0) {
                                    const { pointIndex } = evt.points[0];
                                    const dataPoint = pointIndex;
                                    const { datasetId } = evt.points[0].data.datasetId;
                                    const drilldownId = evt.points[0].data.drilldown[pointIndex].id;
                                    const drilldownLabel = evt.points[0].data.drilldown[pointIndex].label;
                                    const jobGrid = Ext.getCmp('cpu_user_job_information');

                                    if (jobGrid) {
                                        jobGrid.destroy();
                                    }

                                    self.getJobList(personId, person, dataPoint, datasetId, drilldownId, drilldownLabel);
                                }
                            });
                       }
                   }
                }
                })
            ]
        });

        var analyticPanel = Ext.getCmp('detailed_analytic_panel_' + this.config.analytic);
        analyticPanel.add(drilldownChartContainer);
        analyticPanel.layout.setActiveItem(1);
        analyticPanel.doLayout();
    },

    updateDescription: function (chartStore) {
        var dimsDesc = '<ul>';
        var metricsDesc = '<ul>';
        if (chartStore !== null) {
            for (var i = 0; i < chartStore.getCount(); i++) {
                var md = chartStore.getAt(i).get('dimensions');
                for (var d in md) {
                    if (md.hasOwnProperty(d)) {
                        dimsDesc += '<li><b>' + d + ':</b> ' + md[d] + '</li>\n';
                    }
                }
            }
            for (var k = 0; k < chartStore.getCount(); k++) {
                var md2 = chartStore.getAt(k).get('metrics');
                for (var e in md2) {
                    if (md2.hasOwnProperty(e)) {
                        metricsDesc += '<li><b>' + e + ':</b> ' + md2[e] + '</li>\n';
                    }
                }
            }
        }

        dimsDesc += '</ul>\n';
        metricsDesc += '</ul>';

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
            comments: dimsDesc + metricsDesc,
            subnotes: ''
        });
    },

    getJobList: function (personId, person, dataPoint, datasetId, drilldownId, drilldownLabel) {
        var self = this;
        var filters;
        if (self.jobListFilters == null) {
            filters = {
                data: [
                    {
                        dimension_id: 'person',
                        id: 'person=' + personId,
                        realms: ['SUPREMM'],
                        value_id: personId,
                        value_name: person,
                        checked: true
                    },
                    {
                        id: self.config.histogram.group_by + '=' + drilldownId,
                        value_id: drilldownId,
                        value_name: drilldownLabel,
                        dimension_id: self.config.histogram.group_by,
                        realm: [
                            'SUPREMM'
                        ],
                        checked: true
                    }
                ],
                total: 2
            };
        } else {
            var filterData = self.jobListFilters.slice();

            filterData.push({
                dimension_id: 'person',
                id: 'person=' + personId,
                realms: ['SUPREMM'],
                value_id: personId,
                value_name: person,
                checked: true
            });

            filterData.push({
                id: self.config.histogram.group_by + '=' + drilldownId,
                value_id: drilldownId,
                value_name: drilldownLabel,
                dimension_id: self.config.histogram.group_by,
                realm: [
                    'SUPREMM'
                ],
                checked: true
            });

            filters = {
                data: filterData,
                total: filterData.length
            };
        }

        var baseParams = {
            show_title: true,
            timeseries: false,
            aggregation_unit: 'Auto',
            start_date: Ext.getCmp('efficiency').getDurationSelector().getStartDate().format('Y-m-d'),
            end_date: Ext.getCmp('efficiency').getDurationSelector().getEndDate().format('Y-m-d'),
            global_filters: filters,
            start: 0,
            limit: 20,
            data_series: [{
                category: self.config.realm,
                color: 'auto',
                combine_type: 'side',
                display_type: 'column',
                enabled: true,
                filters: {},
                group_by: self.config.histogram.group_by,
                has_std_err: false,
                id: datasetId,
                ignore_global: false,
                line_type: 'Solid',
                line_width: 2,
                log_scale: false,
                long_legend: true,
                metric: self.config.histogram.metric,
                realm: self.config.realm,
                shadow: false,
                sort_type: 'value_desc',
                std_err: false,
                std_err_labels: '',
                trend_line: false,
                value_labels: false,
                visibility: null,
                x_axis: false,
                z_index: 0
            }],
            operation: 'get_rawdata',
            datapoint: dataPoint,
            datasetId: datasetId
        };

        baseParams.global_filters = encodeURIComponent(Ext.util.JSON.encode(baseParams.global_filters));
        baseParams.data_series = encodeURIComponent(Ext.util.JSON.encode(baseParams.data_series));

        var jobListStore = new CCR.xdmod.CustomJsonStore({
            autoDestroy: false,
            autoLoad: true,
            root: 'data',
            totalProperty: 'totalCount',
            successProperty: 'success',
            messageProperty: 'message',
            baseParams: baseParams,
            proxy: new Ext.data.HttpProxy({
                method: 'POST',
                url: 'controllers/metric_explorer.php'
            }),
            fields: [
                { name: 'name', mapping: 'name', type: 'string' },
                { name: 'resource', mapping: 'resource', type: 'string' },
                { name: 'jobid', mapping: 'jobid', type: 'int' },
                { name: 'local_job_id', mapping: 'local_job_id', type: 'int' },
                { name: 'start_time_ts', mapping: 'start_time_ts', type: 'int' },
                { name: 'timezone', mapping: 'timezone', type: 'string' },
                { name: 'cpu_user', mapping: 'cpu_user', type: 'string' },
                { name: 'gpu_usage', mapping: 'gpu_usage', type: 'int' },
                { name: 'max_memory', mapping: 'max_memory', type: 'int' },
                { name: 'catastrophe', mapping: 'catastrophe', type: 'int' },
                { name: 'end_time_ts', mapping: 'end_time_ts', type: 'int' },
                { name: 'wall_time_total', mapping: 'wall_time_total', type: 'int' }
            ]
        });

        var column;
        switch (self.config.analytic) {
            case 'CPU Usage':
                column = {
                    id: 'cpu_user_value',
                    dataIndex: 'cpu_user',
                    header: 'CPU User Value',
                    renderer: function (value, p, r) {
                        if (!r.json.cpu_user) {
                            return String(r.json.cpu_user);
                        }

                        return (r.json.cpu_user * 100).toFixed(2) + '%';
                    }
                };
                break;
            case 'GPU Usage':
                column = {
                    id: 'gpu_usage',
                    dataIndex: 'gpu_usage',
                    header: 'GPU Usage Value',
                    renderer: function (value, p, r) {
                        if (!r.json.gpu_usage) {
                            return String(r.json.gpu_usage);
                        }

                        return (r.json.gpu_usage * 100).toFixed(2) + '%';
                    }
                };
                break;
            case 'Memory Usage':
                column = {
                    id: 'max_memory',
                    dataIndex: 'max_memory',
                    header: 'Max Memory',
                    renderer: function (value, p, r) {
                        if (!r.json.max_memory) {
                            return String(r.json.max_memory);
                        }

                        return (r.json.max_memory * 100).toFixed(2) + '%';
                    }
                };
                break;
            case 'Homogeneity':
                column = {
                    id: 'catastrophe',
                    dataIndex: 'catastrophe',
                    header: 'Catastrophe',
                    renderer: function (value, p, r) {
                        if (!r.json.catastrophe) {
                            return String(r.json.catastrophe);
                        }

                        return (r.json.catastrophe * 100).toFixed(5);
                    }
                };
                break;
            case 'Wall Time Accuracy':
            case 'Short Job Count':
                column = {
                    id: 'job_wall_time',
                    dataIndex: 'start_time_ts',
                    header: 'Job Wall Time',
                    renderer: function (value, p, r) {
                        return (r.json.end_time_ts - r.json.start_time_ts) + 's';
                    }
                };
                break;
            default:
                column = {
                    hidden: true
                };
        }

        var rawDataGrid = new Ext.grid.GridPanel({
            id: 'raw_data_grid_efficiency',
            region: 'center',
            store: jobListStore,
            loadMask: true,
            border: false,
            colModel: new Ext.grid.ColumnModel({
                defaults: {
                    width: 120,
                    sortable: false,
                    menuDisabled: true
                },
                columns: [{
                    id: 'start_time_ts',
                    dataIndex: 'start_time_ts',
                    header: 'Start Time',
                    width: 140,
                    renderer: function (value, p, r) {
                        return moment.tz(value * 1000, r.json.timezone).format('Y-MM-DD HH:mm:ss z');
                    }
                }, {
                    id: 'raw_data_username',
                    dataIndex: 'name',
                    header: 'User'
                },
                {
                    id: 'local_job_id',
                    dataIndex: 'local_job_id',
                    header: 'Job Id'
                },
                column]
            }),
            listeners: {
                rowclick: function (grid, row_index) {
                    var record = grid.getStore().getAt(row_index);

                    var info = {
                        realm: self.config.realm,
                        text: record.get('resource') + '-' + record.get('local_job_id'),
                        local_job_id: record.get('local_job_id'),
                        job_id: record.get('jobid'),
                        title: 'efficiency-tab'
                    };

                    Ext.getCmp('raw_data_window').close();

                    var token = 'job_viewer?job=' + window.btoa(JSON.stringify(info));
                    Ext.History.add(token);
                }
            },
            bbar: new Ext.PagingToolbar({
                pageSize: 20,
                displayInfo: true,
                displayMsg: 'Showing jobs {0} - {1} of {2}',
                emptyMsg: 'No jobs to display',
                store: jobListStore,
                listeners: {
                    load: function (store, records, options) {
                        this.onLoad(store, records, options);
                    }
                }
            })
        });

        var rawData = new Ext.Window({
            id: 'raw_data_window',
            height: 510,
            width: 500,
            closable: true,
            border: false,
            modal: true,
            // Update title when all statistics are in
            title: 'Jobs with ' + drilldownLabel + ' ' + self.config.histogram.groupByTitle + ' for ' + person,
            layout: 'fit',
            autoScroll: true,
            items: new Ext.Panel({
                layout: 'border',
                items: rawDataGrid
            }),
            listeners: {
                close: function () {
                    rawData.hide();
                }
            }
        });

        rawData.show();
    },

    // Destroy chart when panel is destroyed
    listeners: {
        destroy: function (e) {
            if (this.chart) {
                this.chart.destroy();
                this.chart = null;
            }
        }
    },

    randomInt: function (min, max) {
        // eslint-disable-next-line no-mixed-operators
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
});
