
Ext.ns('XDMoD', 'XDMoD.SupremmDataFlow');

XDMoD.SupremmDataFlow = {
    resource_map: {},
    loadData: function (selector, endPoint, resourceId) {
        $(selector).html('<img src="/gui/images/loading.gif"></img>Loading');

        $.getJSON(XDMoD.REST.url + '/supremm_dataflow/dbstats',
            {
                token: XDMoD.REST.token,
                resource_id: resourceId,
                db_id: endPoint
            },
            function (data) {
                var html = '<ul>';
                var d = data.data.data;
                for (var k in d) {
                    if (d.hasOwnProperty(k)) {
                        html += '<li>' + k + ': ' + d[k] + '</li>';
                    }
                }
                html += '</ul>';
                $(selector).html(html);
            }
        ).fail(function (jqXHR, textStatus, errorThrown) {
            var html = '<b>Error<b>';
            if (jqXHR.responseJSON) {
                if (jqXHR.responseJSON.message) {
                    html += '<br />' + jqXHR.responseJSON.message;
                }
            } else {
                html += textStatus + ' ' + errorThrown;
            }
            $(selector).html(html);
        });
    },
    loadAllStats: function (resourceId) {
        $('#pagetitle').text('Data flow information for ' + XDMoD.SupremmDataFlow.resource_map[resourceId]);
        $('#flowchart').show(500);

        XDMoD.SupremmDataFlow.loadData('#local_mirror_content', 'nodearchives', resourceId);
        XDMoD.SupremmDataFlow.loadData('#accountfact_content', 'accountfact', resourceId);
        XDMoD.SupremmDataFlow.loadData('#mongo_content', 'summarydb', resourceId);
        XDMoD.SupremmDataFlow.loadData('#jobfact_content', 'jobfact', resourceId);
        XDMoD.SupremmDataFlow.loadData('#aggregates_content', 'aggregates', resourceId);
    }
};

jsPlumb.ready(function () {
    var common = {
        endpoints: ['Blank', 'Blank'],
        overlays: [{ type: 'PlainArrow', options: { location: 1.0 } }],
        connector: 'Flowchart',
        paintStyle: { stroke: '#216477', strokeWidth: 5 }
    };

    const jsPlumbInstance = jsPlumb.newInstance({
        container: document.getElementById('flowchart')
    });

    jsPlumbInstance.connect({
        source: document.getElementById('pcpdatasource'),
        target: document.getElementById('local_mirror'),
        anchors: ['Right', 'Left']
    }, common);

    jsPlumbInstance.connect({
        source: document.getElementById('local_mirror'),
        target: document.getElementById('summarization_scripts'),
        anchors: ['Right', 'Top']
    }, common);

    jsPlumbInstance.connect({
        source: document.getElementById('accountfact'),
        target: document.getElementById('summarization_scripts'),
        anchors: ['Right', 'Left']
    }, common);

    jsPlumbInstance.connect({
        source: document.getElementById('summarization_scripts'),
        target: document.getElementById('mongo'),
        anchors: ['Bottom', 'Top']
    }, common);

    jsPlumbInstance.connect({
        source: document.getElementById('accountfact'),
        target: document.getElementById('etl_process'),
        anchors: ['Right', 'Top']
    }, common);

    jsPlumbInstance.connect({
        source: document.getElementById('mongo'),
        target: document.getElementById('etl_process'),
        anchor: ['Right', 'Right']
    }, common);

    jsPlumbInstance.connect({
        source: document.getElementById('etl_process'),
        target: document.getElementById('jobfact'),
        anchor: ['Left', 'Right']
    }, common);

    jsPlumbInstance.connect({
        source: document.getElementById('resdatasource'),
        target: document.getElementById('accountfact'),
        anchor: ['Right', 'Left']
    }, common);

    jsPlumbInstance.connect({
        source: document.getElementById('jobfact'),
        target: document.getElementById('aggregates'),
        connector: 'Straight',
        anchor: 'AutoDefault'
    }, common);
});

$(document).ready(function () {
    $('#resourceform').hide();
    $('#flowchart').hide();
    $('#resourceform').submit(function (evt) {
        evt.preventDefault();
        $('#flowchart').hide();
        XDMoD.SupremmDataFlow.loadAllStats($('#resourceselect').val());
    });

    $.getJSON(XDMoD.REST.url + '/supremm_dataflow/resources', { token: XDMoD.REST.token }, function (data) {
        var select = document.getElementById('resourceselect');

        for (var i = 0; i < data.data.length; i++) {
            var element = data.data[i];
            var tmp = document.createElement('option');
            tmp.text = element.name;
            tmp.value = element.id;
            select.appendChild(tmp);
            XDMoD.SupremmDataFlow.resource_map[element.id] = element.name;
        }
        $('#loading').hide();
        $('#resourceform').show(500);
        $('#resourceform').submit();
    }).fail(function (jqXHR, textStatus, errorThrown) {
        var html = '<b>Error</b><br />';
        if (jqXHR.responseJSON) {
            if (jqXHR.responseJSON.message) {
                html += jqXHR.responseJSON.message;
            }
        } else {
            html += textStatus + ' ' + errorThrown;
        }
        $('#loading').html(html);
    });
});