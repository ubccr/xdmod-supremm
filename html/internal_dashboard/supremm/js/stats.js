
            Ext.ns('XDMoD');
            jsPlumb.ready(function() {

                var common = {
                      endpoints:["Blank", "Blank" ],
                      overlays: [ [ "PlainArrow", { location: 1.0 } ] ],
                      paintStyle: { strokeStyle:"#216477", lineWidth:5 }
                    };

                jsPlumb.setContainer($("#flowchart"));

                jsPlumb.connect({
                      source:$("#remote_machine"),
                      target: $("#local_mirror"),
                      connector: "Straight",
                      anchor: "AutoDefault"
                  }, common);

                jsPlumb.connect({
                      source:$("#local_mirror"),
                      target: $("#accountfact"),
                      anchors:[ "BottomCenter", "TopCenter" ]
                  }, common);

                jsPlumb.connect({
                      source:$("#local_mirror"),
                      target: $("#mongo"),
                      anchors:[ "BottomCenter", "TopCenter" ]
                  }, common);

                jsPlumb.connect({
                      source:$("#accountfact"),
                      target: $("#mongo"),
                      anchors:[ "BottomCenter", "TopCenter" ]
                  }, common);

                jsPlumb.connect({
                      source:$("#mongo"),
                      target: $("#jobfact"),
                      anchor: "AutoDefault"
                  }, common);

                jsPlumb.connect({
                      source:$("#jobfact"),
                      target: $("#aggregates"),
                      connector: "Straight",
                      anchor: "AutoDefault"
                  }, common);

            });

            var resource_map = {};

            var loadstats = function(resource_id) {

                var loading = "<img src=\"/gui/images/loading.gif\"></img>Loading";

                $("#accountfact_content").html(loading);
                $("#mongo_content").html(loading);
                $("#jobfact_content").html(loading);
                $("#aggregates_content").html(loading);

                var print_list = function(data, selector) {
                    var h = "<ul>";
                    var d = data.data;
                    for (var k in d) {
                        if (d.hasOwnProperty(k)) {
                            h = h + '<li>' + k + ': ' + d[k] + '</li>';
                        }
                    }
                    h = h + "</ul>";
                    $(selector).html(h);
                };

                $.getJSON(XDMoD.REST.url + '/supremm_dataflow/dbstats', { token: XDMoD.REST.token, resource_id: resource_id, db_id: 'accountdb' },
                        function(data) { print_list(data.data, "#accountfact_content"); });
                $.getJSON(XDMoD.REST.url + '/supremm_dataflow/dbstats', { token: XDMoD.REST.token, resource_id: resource_id, db_id: 'summarydb' },
                        function(data) { print_list(data.data, "#mongo_content"); });
                $.getJSON(XDMoD.REST.url + '/supremm_dataflow/dbstats', { token: XDMoD.REST.token, resource_id: resource_id, db_id: 'jobfact' },
                        function(data) { print_list(data.data, "#jobfact_content"); });
                $.getJSON(XDMoD.REST.url + '/supremm_dataflow/dbstats', { token: XDMoD.REST.token, resource_id: resource_id, db_id: 'aggregates' },
                        function(data) { print_list(data.data, "#aggregates_content"); });

                $("#pagetitle").text("Data flow information for " + resource_map[resource_id] );
            };

            $(document).ready(function(){

                $( "#resourceform" ).submit(function(evt) {
                    evt.preventDefault();
                    loadstats( $("#resourceselect").val() );
                });

                $.getJSON(XDMoD.REST.url + '/supremm_dataflow/resources', { token: XDMoD.REST.token }, function (data) {
                    var select = document.getElementById("resourceselect");

                    for (var i = 0; i < data.data.length ; i++) {
                        var element = data.data[i];
                        var tmp = document.createElement("option");
                        tmp.text = element.name;
                        tmp.value = element.id;
                        select.appendChild(tmp);
                        resource_map[element.id] = element.name;
                    }

                    $( "#resourceform" ).submit();
                });

            });
