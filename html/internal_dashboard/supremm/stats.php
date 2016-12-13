<?php
require_once 'user_check.php';
?>
    
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Job timeseries demo</title>
        <script type="text/javascript" src="/gui/lib/jquery/jquery-1.12.4.min.js"></script>
        <script type="text/javascript" src="/gui/lib/jsPlumb/jquery.jsPlumb-1.6.3-min.js"></script>
        <script>
<?php echo "var token='" . $_SESSION['session_token'] . "';" ; ?>
        </script>
        <script type="text/javascript" src="js/stats.js"></script>
        <link rel="stylesheet" href="css/style.css" type="text/css" />
    </head>
    <body>
        <div>
            <form id="resourceform" action="." method="get">
                <select name="resourceid" id="resourceselect"> </select>
                <input type="submit" id="resourcesubmit" value="Show stats" name="showstats" />
            </form>
        </div>
        <h1 id="pagetitle"></h1>
        <div id="flowchart">
            <div id="remote_machine" class="filedatastore">
                Remote Machine
                <div id="remote_machine_content" class="statsbox"></div>
            </div>
            <div id="local_mirror" class="filedatastore">
                Local mirror
                <div id="local_mirror_content" class="statsbox"></div>
            </div>
            <div id="accountfact" class="sqldatastore">
                Accounting data cache
                <div id="accountfact_content" class="statsbox"></div>
            </div>
            <div id="mongo" class="mongodatastore">
                Summary data
                <div id="mongo_content" class="statsbox"></div>
            </div>
            <div id="jobfact" class="sqldatastore">
                SUPREMM Job facts
                <div id="jobfact_content" class="statsbox"></div>
            </div>
            <div id="aggregates" class="sqldatastore">
                Aggregate job data 
                <div id="aggregates_content" class="statsbox"></div>
            </div>
        </div>
        <div id="key">
            <p>Key:</p>
            <ul>
                <li><span class="filekey">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> File storage</li>
                <li><span class="sqlkey">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> MySQL storage</li>
                <li><span class="mongokey">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> Mongo storage</li>
            </ul>
        </div>
    </body>
</html>
