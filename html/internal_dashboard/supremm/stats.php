<?php
require_once 'user_check.php';
?>

<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Job timeseries demo</title>
        <script type="text/javascript" src="/gui/lib/jquery/jquery-3.6.0.min.js"></script>
        <script type="text/javascript" src="/gui/lib/jsPlumb/jquery.jsPlumb-1.6.3-min.js"></script>

        <!-- Ext and Jquery adapter -->
        <script type="text/javascript" src="/gui/lib/extjs/adapter/jquery/ext-jquery-adapter.js"></script>
        <script type="text/javascript" src="/gui/lib/extjs/ext-all-debug.js"></script>

        <script type="text/javascript">
            <?php \xd_rest\printJavascriptVariables(); ?>
        </script>

        <script type="text/javascript" src="js/stats.js"></script>
        <link rel="stylesheet" href="css/style.css" type="text/css" />
    </head>
    <body>
        <div id="loading"><img src="/gui/images/loading.gif"></img>Loading</div>
        <div>
            <form id="resourceform" action="." method="get">
                <select name="resourceid" id="resourceselect"> </select>
                <input type="submit" id="resourcesubmit" value="Show stats" name="showstats" />
            </form>
        </div>
        <h1 id="pagetitle"></h1>
        <div id="flowchart">
            <div id="local_mirror" class="filedatastore datastore">
                PCP archive files
                <div id="local_mirror_content" class="statsbox"></div>
            </div>
            <div id="accountfact" class="sqldatastore datastore">
                Accounting data in Open XDMoD datawarehouse
                <div id="accountfact_content" class="statsbox"></div>
            </div>
            <div id="mongo" class="mongodatastore datastore">
                Job summary documents
                <div id="mongo_content" class="statsbox"></div>
            </div>
            <div id="jobfact" class="sqldatastore datastore">
                SUPREMM job records in Open XDMoD datawarehouse
                <div id="jobfact_content" class="statsbox"></div>
            </div>
            <div id="pcpdatasource" class="datasource">
                <span class="centered">PCP running on compute nodes</span>
            </div>
            <div id="resdatasource" class="datasource">
                <span class="centered">Resource manager logs</span>
            </div>
            <div id="summarization_scripts" class="process">
                <span class="centered">SUPReMM<br />summarization scripts</span>
            </div>
            <div id="etl_process" class="process">
                <span class="centered">SUPReMM<br />ETL process</span>
            </div>
            <div id="aggregates" class="sqldatastore datastore">
                Aggregated SUPReMM data in Open XDMoD datawarehouse
                <div id="aggregates_content" class="statsbox"></div>
            </div>
            <div id="key">
                <p>Key:</p>
                <ul>
                    <li><span class="filekey">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> File storage</li>
                    <li><span class="sqlkey">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> MySQL storage</li>
                    <li><span class="mongokey">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> Mongo storage</li>
                </ul>
            </div>
        </div>
    </body>
</html>
