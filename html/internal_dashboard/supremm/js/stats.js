
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
        overlays: [['PlainArrow', { location: 1.0 }]],
        connector: 'Flowchart',
        paintStyle: { strokeStyle: '#216477', lineWidth: 5 }
    };

    jsPlumb.setContainer($('#flowchart'));

    jsPlumb.connect({
        source: $('#pcpdatasource'),
        target: $('#local_mirror'),
        anchors: ['Right', 'Left']
    }, common);

    jsPlumb.connect({
        source: $('#local_mirror'),
        target: $('#summarization_scripts'),
        anchors: ['Right', 'Top']
    }, common);

    jsPlumb.connect({
        source: $('#accountfact'),
        target: $('#summarization_scripts'),
        anchors: ['Right', 'Left']
    }, common);

    jsPlumb.connect({
        source: $('#summarization_scripts'),
        target: $('#mongo'),
        anchors: ['Bottom', 'Top']
    }, common);

    jsPlumb.connect({
        source: $('#accountfact'),
        target: $('#etl_process'),
        anchors: ['Right', 'TopCenter']
    }, common);

    jsPlumb.connect({
        source: $('#mongo'),
        target: $('#etl_process'),
        anchor: ['Right', 'Right']
    }, common);

    jsPlumb.connect({
        source: $('#etl_process'),
        target: $('#jobfact'),
        anchor: ['Left', 'Right']
    }, common);

    jsPlumb.connect({
        source: $('#resdatasource'),
        target: $('#accountfact'),
        anchor: ['Right', 'Left']
    }, common);

    jsPlumb.connect({
        source: $('#jobfact'),
        target: $('#aggregates'),
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
