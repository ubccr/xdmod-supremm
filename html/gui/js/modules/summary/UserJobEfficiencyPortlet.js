/* eslint no-param-reassign: false */
/**
 * XDMoD.Modules.SummaryPortlets.UserJobEfficiencyPortlet
 *
 */

Ext.namespace('XDMoD.Modules.SummaryPortlets');

XDMoD.Modules.SummaryPortlets.UserJobEfficiencyPortlet = Ext.extend(Ext.ux.Portlet, {

    layout: 'fit',
    title: 'User Job Efficiency Rating',
    coreChartDivId: this.id+"-core-ratio-chart",
    jobChartDivId: this.id+"-job-ratio-chart",
    cls: 'user-efficiency-portlet',
    tpl: new Ext.XTemplate(
        "<div><p>Job Efficiency for {start_date} to {end_date}</p></div>",
        "<div class='user-efficiency-data-row'>",
          "<div id='{job_ratio_chart_id}' class='float-left'></div>",
          "<div class='user-efficiency-details float-left'><div class='user-job-efficiency-portlet-job-count user-efficiency-detail'><h2>Total Job Count</h2>{job_count}</div>",
          "<div class='user-job-efficiency-portlet-job-count-bad user-efficiency-detail'><h2>Inefficient Job Count</h2>{job_count_bad}</div></div>",
        "</div>",
        "<div class='user-efficiency-data-row'>",
          "<div id='{core_ratio_chart_id}' class='float-left'></div>",
          "<div class='user-efficiency-details float-left'><div class='user-core-efficiency-portlet-core-time user-efficiency-detail'><h2>Total Core Time</h2>{core_time}</div>",
          "<div class='user-core-efficiency-portlet-bad-core-time user-efficiency-detail'><h2>Inefficient Core Time</h2>{core_time_bad}</div></div>",
        "</div>"
    ),
    initComponent: function () {
        this.height = this.width * (11.0 / 17.0);

        var end_date = new Date();
        var start_date = end_date.add(Date.DAY, -30);

        var jobStore = new Ext.data.JsonStore({
           restful: true,
           url: XDMoD.REST.url + '/warehouse/aggregatedata',
           root: 'results',
           autoLoad: true,
           baseParams: {
               start: 0,
               limit: 1,
               config: JSON.stringify({
                   realm: 'JobEfficiency',
                   group_by: 'person',
                   aggregation_unit: 'day',
                   start_date: Ext.util.Format.date(start_date, 'Y-m-d'),
                   end_date: Ext.util.Format.date(end_date, 'Y-m-d'),
                   person_id: CCR.xdmod.ui.mappedPID,
                   order_by: {
                       field: 'core_time_bad',
                       dirn: 'desc'
                   },
                   statistics: ['core_time_bad', 'bad_core_ratio']
               })
           },
           fields: [{
                name: 'name',
                type: 'string'
            }, {
                name: 'core_time_bad',
                type: 'float'
            }, {
                name: 'bad_core_ratio',
                type: 'float'
            },
            {
                name: 'bad_job_ratio',
                type: 'float'
            },
            {
                name: 'core_time',
                type: 'float',
            },
            {
                name: 'job_count',
                type: 'float',
            },
            {
                name: 'job_count_bad',
                type: 'float'
           }],
           listeners: {
                load: function(jobStore, records, options){
                  if(records.length > 0){
                     var data = records[0].data;

                     data.core_time = Math.round(data.core_time * 100) / 100;
                     data.core_time_bad = Math.round(data.core_time_bad * 100) / 100;
                     data.job_ratio_chart_id = this.jobChartDivId;
                     data.core_ratio_chart_id = this.coreChartDivId;
                     data.start_date = Ext.util.Format.date(start_date, 'm-d-Y');
                     data.end_date = Ext.util.Format.date(end_date, 'm-d-Y');

                     this.update(data);

                     var chartsToMake = [{
                        renderToDivId: this.coreChartDivId,
                        chartTitle: 'Core<br />Efficiency',
                        seriesLabel: 'Core Efficiency',
                        totalDataValue: data.core_time,
                        numberGoodDataValue: data.core_time - data.core_time_bad,
                        numberBadDataValue: data.core_time_bad
                     },
                     {
                         renderToDivId: this.jobChartDivId,
                         chartTitle: 'Job<br />Efficiency',
                         seriesLabel: 'Job Efficiency',
                         totalDataValue: data.job_count,
                         numberGoodDataValue: data.job_count - data.job_count_bad,
                         numberBadDataValue: data.job_count_bad
                     }];

                     var chart_details = {
                        chart: {
                              plotBackgroundColor: null,
                              plotBorderWidth: 0,
                              plotShadow: false,
                              margin: [0,0,0,0],
                              spacing: [0,0,0,0],
                              width: 315,
                              height: 175
                        },
                        title: {
                              align: 'center',
                              verticalAlign: 'middle',
                              y: 30
                        },
                        tooltip: {
                              pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                        },
                        plotOptions: {
                              pie: {
                                  startAngle: -90,
                                  endAngle: 90,
                                  center: ['50%', '100%'],
                                  size: '200%',
                                  sliceOffset: 0,
                                  dataLabels: {
                                    enabled: false,
                                  }
                              }
                        },
                        series: [{
                          type: 'pie',
                          innerSize: '60%',
                          data: [
                            {
                              name:'Good',
                              color: 'green'
                            },
                            {
                              name: 'Bad',
                              color: 'red'
                            }
                           ]
                        }]
                      };

                      chartsToMake.forEach(function(value, index){
                          chart_details.chart.renderTo = value.renderToDivId;
                          chart_details.title.text = value.chartTitle;
                          chart_details.series[0].name = value.seriesLabel;
                          chart_details.series[0].data[0].y = value.numberGoodDataValue;
                          chart_details.series[0].data[1].y = value.numberBadDataValue;

                          new Highcharts.Chart(chart_details);
                      });
                  }
                  else {
                      this.tpl = new Ext.XTemplate('<h3>No Job efficiency data available for this user or time frame</h3>');
                      this.update();
                  }
              }.bind(this)
           }
       });

       XDMoD.Modules.SummaryPortlets.UserJobEfficiencyPortlet.superclass.initComponent.apply(this, arguments);
    }
});

Ext.reg('UserJobEfficiencyPortlet', XDMoD.Modules.SummaryPortlets.UserJobEfficiencyPortlet);
