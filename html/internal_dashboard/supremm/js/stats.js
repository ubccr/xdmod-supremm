
Ext.ns('XDMoD', 'XDMoD.SupremmDataFlow');

XDMoD.SupremmDataFlow = {
    resource_map: {},
    loadData: function (selector, endPoint, resourceId) {
        const el = document.querySelector(selector);
        el.innerHTML = '<img src="/gui/images/loading.gif"></img>Loading';

        const response = fetch(`${XDMoD.REST.url}/supremm_dataflow/dbstats?token=${XDMoD.REST.token}&resource_id=${resourceId}&db_id=${endPoint}`, {
            method: 'GET',
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`[<b>Error<b> ${response.status}]: ${response.statusText}`);
            } else {
                return response.json();
            }
        })
        .then((data) => {
            let html = '<ul>';
            let d = data.data.data;
            for (let k in d) {
                if (d.hasOwnProperty(k)) {
                    html += '<li>' + k + ': ' + d[k] + '</li>';
                }
            }
            html += '</ul>';
            el.innerHTML = html;
            el.display = 'none';
        })
        .catch((errorText) => document.querySelector('#loading').innerHTML = errorText);
    },
    loadAllStats: function (resourceId) {
        document.querySelector('#pagetitle').textContent = 'Data flow information for ' + XDMoD.SupremmDataFlow.resource_map[resourceId];
        document.querySelector('#flowchart').classList.replace('hide', 'show');

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

document.addEventListener("DOMContentLoaded", function () {
    document.querySelector('#resourceform').display = 'none';
    document.querySelector('#flowchart').display = 'none';

    document.querySelector('#resourceform').addEventListener('submit', (evt) => {
        evt.preventDefault();
        document.querySelector('#flowchart').display = 'none';
        XDMoD.SupremmDataFlow.loadAllStats(document.querySelector('#resourceselect').value);
    })

    const response = fetch(`${XDMoD.REST.url}/supremm_dataflow/resources?token=${XDMoD.REST.token}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            "Content-Type": "application/json",
        }
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`[<b>Error<b> ${response.status}]: ${response.statusText}`);
        } else {
            return response.json();
        }
    })
    .then((data) => {
        let select = document.getElementById('resourceselect');
        const form = document.querySelector('#resourceform');
        for (var i = 0; i < data.data.length; i++) {
            var element = data.data[i];
            var tmp = document.createElement('option');
            tmp.text = element.name;
            tmp.value = element.id;
            select.appendChild(tmp);
            XDMoD.SupremmDataFlow.resource_map[element.id] = element.name;
        }
        document.querySelector('#loading').display = 'none';
        document.querySelector('#resourceform').classList.replace('hide', 'show');
        //form.submit();
    })
    .catch((errorText) => document.querySelector('#loading').innerHTML = errorText);
});
